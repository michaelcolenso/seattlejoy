import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const BASE = 'http://info.kingcounty.gov/Assessor/eRealProperty/';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pin: string }> }
) {
  const { pin } = await params;

  const url = `${BASE}Dashboard.aspx?ParcelNbr=${encodeURIComponent(pin)}`;

  let body: string;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'SeattleJoy/2.0 (property data proxy)' },
      next: { revalidate: 3600 },
    });
    body = await response.text();
  } catch {
    return NextResponse.json({ error: 'upstream fetch failed' }, { status: 502 });
  }

  const $ = cheerio.load(body);
  const imgSrc = $('#kingcounty_gov_cphContent_FormViewPictCurr_CurrentImage').attr('src');
  const details: string[] = [];
  $('td', '#kingcounty_gov_cphContent_DetailsViewPropTypeR').each((_, el) => {
    details.push($(el).text().trim());
  });

  return NextResponse.json({
    imageUrl:  imgSrc ? BASE + imgSrc : null,
    yearBuilt: details[1] ?? null,
    sqft:      details[3] ?? null,
    beds:      details[5] ?? null,
    baths:     details[7] ?? null,
    grade:     details[9] ?? null,
    condition: details[11] ?? null,
  });
}
