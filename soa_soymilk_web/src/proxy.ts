import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const STAFF_ID_COOKIE = 'pos_staff_id';
const STAFF_NAME_COOKIE = 'pos_staff_name';
const STAFF_PHONE_COOKIE = 'pos_staff_phone';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/pos')) {
    return NextResponse.next();
  }

  const staffId = request.cookies.get(STAFF_ID_COOKIE)?.value;
  const staffName = request.cookies.get(STAFF_NAME_COOKIE)?.value;
  const staffPhone = request.cookies.get(STAFF_PHONE_COOKIE)?.value;

  if (staffId && staffName && staffPhone) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/', request.url);
  loginUrl.searchParams.set('posLogin', '1');

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/pos/:path*'],
};
