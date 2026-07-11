import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export function middleware(request) {
  return NextResponse.next();
}