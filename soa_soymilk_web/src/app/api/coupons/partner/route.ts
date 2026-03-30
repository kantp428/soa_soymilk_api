import { NextResponse } from 'next/server';

const PARTNER_COUPON_URL = 'https://everywear-production.up.railway.app/api/coupons/partner';

export async function POST() {
  try {
    const response = await fetch(PARTNER_COUPON_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          message: 'Partner coupon request failed',
          status: response.status,
          body: responseText,
        },
        { status: response.status }
      );
    }

    return new NextResponse(responseText, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Unable to reach partner coupon service',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 }
    );
  }
}
