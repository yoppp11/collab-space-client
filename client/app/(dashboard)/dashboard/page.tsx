'use client';

import { motion } from 'framer-motion';
import { FileText, Users, CheckSquare, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useWorkspaces } from '@/lib/api/workspaces';
import { useDocuments } from '@/lib/api/documents';
import { useNotifications } from '@/lib/api/notifications';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data: workspaces } = useWorkspaces();
  const { data: documents } = useDocuments();
  const { data: notifications } = useNotifications({ limit: 5 });

  const stats = [
    {
      title: 'Total Documents',
      value: documents?.length || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
      href: '/dashboard/documents',
    },
    {
      title: 'Active Workspaces',
      value: workspaces?.length || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
      href: '/dashboard/workspaces',
    },
    {
      title: 'Recent Notifications',
      value: notifications?.length || 0,
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950',
      href: '/dashboard/notifications',
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome back, {user?.first_name || user?.username || 'User'}! 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s what&apos;s happening with your projects today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-3"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Link href={stat.href}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} ${stat.color} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/documents/new">
            <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="bg-primary/10 p-4 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">New Document</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create a new document
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/workspaces">
            <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-950 p-4 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900 transition-colors">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Workspaces</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Browse workspaces
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/notifications">
            <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="bg-green-100 dark:bg-green-950 p-4 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900 transition-colors">
                  <CheckSquare className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Notifications</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    View notifications
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/profile">
            <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="bg-orange-100 dark:bg-orange-950 p-4 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900 transition-colors">
                  <Plus className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Profile</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage your profile
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid gap-6 md:grid-cols-2"
      >
        {/* Recent Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Documents</CardTitle>
            <Link href="/dashboard/documents">
              <Button variant="ghost" size="sm" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {documents && documents.length > 0 ? (
              <div className="space-y-3">
                {documents.slice(0, 5).map((doc) => (
                  <Link key={doc.id} href={`/dashboard/documents/${doc.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <span className="text-2xl">{doc.icon || '📄'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.last_edited_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No documents yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Workspaces */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Workspaces</CardTitle>
            <Link href="/dashboard/workspaces">
              <Button variant="ghost" size="sm" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {workspaces && workspaces.length > 0 ? (
              <div className="space-y-3">
                {workspaces.slice(0, 5).map((workspace) => (
                  <Link key={workspace.id} href={`/dashboard/workspaces/${workspace.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-white shrink-0"
                        style={{ backgroundColor: workspace.icon_color }}
                      >
                        {workspace.icon || workspace.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{workspace.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {workspace.member_count || 0} members
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No workspaces yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
//         </h1>
//         <p className="text-muted-foreground mt-2">
//           Here&apos;s what&apos;s happening with your workspace today.
//         </p>
//       </motion.div>

//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//         {stats.map((stat, index) => (
//           <motion.div
//             key={stat.title}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 * index, duration: 0.4 }}
//           >
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <CardTitle className="text-sm font-medium">
//                   {stat.title}
//                 </CardTitle>
//                 <div className={`p-2 rounded-lg ${stat.bgColor}`}>
//                   <stat.icon className={`h-4 w-4 ${stat.color}`} />
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-3xl font-bold">{stat.value}</div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         ))}
//       </div>

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.5 }}
//         className="grid gap-6 md:grid-cols-2"
//       >
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Documents</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-muted-foreground text-sm">
//               Your recent documents will appear here.
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Activity Feed</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-muted-foreground text-sm">
//               Recent activity from your team will appear here.
//             </p>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// }
