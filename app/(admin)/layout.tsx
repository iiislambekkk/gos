import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {Sidebar} from "@/components/sidebar";
import {Navbar} from "@/components/navbar";

export default async function AdminLayout({
                                              children,
                                          }: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) redirect("/login");
    if (session.user.role !== "ADMIN") redirect("/");

    return <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
            <Navbar user={session.user} />
            <main className="flex-1 p-4 md:p-6">
                {children}
            </main>
        </div>
    </div>;
}