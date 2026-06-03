"use client";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden border-r border-border lg:flex">
          <div className="flex w-full flex-col justify-between p-12">
            <div>
              <div className="text-xl font-semibold">
                DocuFlow
              </div>

              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                AI workspace built around conversations,
                documents, knowledge bases and your own models.
              </p>
            </div>

            <div className="space-y-5">
              <Feature>
                Chat across documents and conversations
              </Feature>

              <Feature>
                Connect OpenAI, Anthropic and more
              </Feature>

              <Feature>
                Build private knowledge bases
              </Feature>

              <Feature>
                Organize work with namespaces
              </Feature>
            </div>

            <div className="text-xs text-muted-foreground">
              DocuFlow
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight">
                {title}
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                {subtitle}
              </p>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-2 rounded-full bg-foreground/70" />
      <div className="text-sm text-muted-foreground">
        {children}
      </div>
    </div>
  );
}