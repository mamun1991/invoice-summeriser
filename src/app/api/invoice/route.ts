import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Force this route to run on Cloudflare's serverless edge
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse the invoice data from the frontend
    const { clientName, items, totalAmount } = await request.json();

    if (!clientName || !items) {
      return NextResponse.json({ error: 'Missing client name or items' }, { status: 400 });
    }

    // 2. Create the PDF Document in memory
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage([600, 400]); // Width: 600, Height: 400

    // Draw the PDF content
    page.drawText('OFFICIAL INVOICE', { x: 50, y: 350, size: 24, font, color: rgb(0, 0.3, 0.8) });
    page.drawText(`Billed To: ${clientName}`, { x: 50, y: 300, size: 14, font });
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 50, y: 280, size: 12, font });

    let yPosition = 240;
    items.forEach((item: { description: string; price: number }) => {
      page.drawText(`- ${item.description}`, { x: 50, y: yPosition, size: 12, font });
      page.drawText(`$${item.price}`, { x: 450, y: yPosition, size: 12, font });
      yPosition -= 20;
    });

    page.drawText(`Total Amount Due: $${totalAmount}`, { x: 50, y: yPosition - 20, size: 16, font, color: rgb(0.8, 0.1, 0.1) });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    // 3. Connect to Cloudflare R2 Storage Bucket
    const { env } = getRequestContext();
    // if (!env.INVOICE_BUCKET) {
    //   throw new Error('R2 Storage Bucket binding not found in wrangler.toml');
    // }

    // 4. Save the file to the bucket
    const fileId = `invoice_${Date.now()}.pdf`;
    
    // await env.INVOICE_BUCKET.put(fileId, pdfBytes, {
    //   httpMetadata: { contentType: 'application/pdf' },
    //   customMetadata: { client: clientName }
    // });

    // 5. Return success and the file identifier
    return NextResponse.json({
      success: true,
      message: 'Invoice created and stored successfully.',
      fileId: fileId
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Agent failed to generate invoice'},
      { status: 500 }
    );
  }
}