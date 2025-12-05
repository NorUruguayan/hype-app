   import { createServerClient } from '@supabase/ssr';
   import { cookies } from 'next/headers';
   import { NextRequest, NextResponse } from 'next/server';

   export async function DELETE(request: NextRequest) {
     const cookieStore = await cookies();  // Add await here to handle it as a Promise

     const supabase = createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           getAll() {
             return cookieStore.getAll();
           },
           setAll(cookiesToSet) {
             cookiesToSet.forEach(({ name, value, options }) =>
               cookieStore.set(name, value, options)
             );
           },
         },
       }
     );

     const {
       data: { user },
     } = await supabase.auth.getUser();

     if (!user) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     // Rest of your delete logic (e.g., delete user account)
     // Example: await supabase.auth.admin.deleteUser(user.id);
     return NextResponse.json({ message: 'Account deleted' });
   }
   