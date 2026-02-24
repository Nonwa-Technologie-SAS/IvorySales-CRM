import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'auth_session';
const AUTH_ROLE_COOKIE = 'auth_role';

/** Routes accessibles sans connexion */
const PUBLIC_PATHS = ['/login', '/login/mfa', '/forgot-password', '/reset-password'];

/** Pages réservées à ADMIN et MANAGER (AGENT refusé selon roles-and-permissions) */
const ADMIN_OR_MANAGER_PATHS = ['/users', '/settings', '/products-services'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isAdminOrManagerOnlyPath(pathname: string): boolean {
  return ADMIN_OR_MANAGER_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuth = request.cookies.has(AUTH_COOKIE);
  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value;

  // Fichiers statiques et API exclues
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Déjà connecté ET sur une page publique → redirection vers le dashboard
  if (hasAuth && isPublicPath(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Non connecté ET page protégée → redirection vers login
  if (!hasAuth && !isPublicPath(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Pages Utilisateurs / Paramètres : réservées à ADMIN et MANAGER (pas AGENT)
  if (hasAuth && isAdminOrManagerOnlyPath(pathname)) {
    // On ne bloque que si un rôle explicite non autorisé est présent.
    // Si le cookie de rôle est absent (anciens logins), on laisse passer
    // et on se repose sur les gardes de page + API.
    if (role && role !== 'ADMIN' && role !== 'MANAGER') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
