'use client';

import { motion } from 'framer-motion';
import { Plus, FileText, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useDocuments } from '@/lib/api/documents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export default function DocumentsPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: documents, isLoading } = useDocuments();

  const filteredDocuments = Array.isArray(documents)
    ? documents.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('document.title')}</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your documents
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/documents/new')} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          {t('document.new_document')}
        </Button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('search') + ' documents...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          {t('filter')}
        </Button>
      </motion.div>

      {/* Documents List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : filteredDocuments && filteredDocuments.length > 0 ? (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {filteredDocuments.map((doc) => (
            <motion.div key={doc.id} variants={item}>
              <Card
                className="group cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary/50"
                onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-2xl shrink-0 group-hover:scale-110 transition-transform">
                      {doc.icon || '📄'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1">{doc.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Last edited {new Date(doc.last_edited_at).toLocaleDateString()} by{' '}
                        {doc.last_edited_by?.first_name || doc.last_edited_by?.username}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.is_archived && <Badge variant="secondary">Archived</Badge>}
                      {doc.is_template && <Badge variant="outline">Template</Badge>}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="rounded-full bg-primary/10 p-6 mb-6">
            <FileText className="h-16 w-16 text-primary" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">
            {searchQuery ? t('no_results') : t('document.no_documents')}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchQuery
              ? 'Try adjusting your search to find what you\'re looking for'
              : t('document.create_first')}
          </p>
          {!searchQuery && (
            <Button onClick={() => router.push('/dashboard/documents/new')} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              {t('document.new_document')}
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
