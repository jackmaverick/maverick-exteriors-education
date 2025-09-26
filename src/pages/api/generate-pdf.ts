import type { APIRoute } from 'astro';
import puppeteer from 'puppeteer';

export const GET: APIRoute = async ({ url, request }) => {
  const urlParams = new URL(request.url).searchParams;
  const pageUrl = urlParams.get('url');
  const filename = urlParams.get('filename') || 'maverick-exteriors-guide';

  if (!pageUrl) {
    return new Response('Missing URL parameter', { status: 400 });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to the page
    await page.goto(pageUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
        right: '0.5in'
      }
    });

    await browser.close();

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return new Response('PDF generation failed', { status: 500 });
  }
};