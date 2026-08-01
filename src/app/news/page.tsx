import { listNewsPosts } from "../api/_db";

export const dynamic = "force-dynamic";

type NewsPost = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body: string;
  cover_image: string;
  author: string;
  status: "draft" | "published";
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function bodyPreview(post: NewsPost) {
  return (post.body || post.excerpt || "").split("\n").filter(Boolean).slice(0, 3);
}

export default async function NewsPage() {
  const { posts = [] } = await listNewsPosts(false);
  const newsPosts = posts as NewsPost[];
  const featured = newsPosts.find((post) => post.is_featured) || newsPosts[0];
  const otherPosts = featured ? newsPosts.filter((post) => post.id !== featured.id) : newsPosts;

  return (
    <main className="min-h-screen bg-[#f4faf8] px-5 pb-16 pt-28 text-[#082c3a] md:px-10">
      <section className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#117865]">
          TRI-P Tech
        </p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              News
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#4f6a72]">
              Company updates, solar education, project stories, and customer notices from the TRI-P Tech team.
            </p>
          </div>
          <a
            href="/services/solar/calculator"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#117865] px-5 text-sm font-bold text-white transition hover:bg-[#0d6757]"
          >
            Estimate a solar system
          </a>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-6xl">
        {!newsPosts.length ? (
          <div className="rounded-lg border border-[#d8e7e3] bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold">No news posts yet</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#60777f]">
              Published updates will appear here once the team adds them from the admin news section.
            </p>
          </div>
        ) : null}

        {featured ? (
          <article className="overflow-hidden rounded-lg border border-[#d8e7e3] bg-white shadow-sm">
            <div className="grid lg:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)]">
              <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-[#082c3a] p-6 md:p-8">
                {featured.cover_image ? (
                  <>
                    <img
                      src={featured.cover_image}
                      alt=""
                      className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#082c3a]/70 via-[#117865]/40 to-[#041923]/80" />
                    <img
                      src={featured.cover_image}
                      alt=""
                      className="relative z-10 max-h-[520px] w-auto max-w-full rounded-md bg-white/5 object-contain shadow-[0_26px_70px_rgba(0,0,0,0.35)]"
                    />
                  </>
                ) : (
                  <div className="relative z-10 flex min-h-64 items-center justify-center rounded-md px-8 text-center text-white">
                    <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#8bd7c8]">
                      Featured update
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6 md:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#eef8f5] px-3 py-1 text-xs font-bold text-[#117865]">
                    {featured.category}
                  </span>
                  <span className="rounded-full bg-[#082c3a] px-3 py-1 text-xs font-bold text-white">
                    Featured
                  </span>
                </div>
                <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#082c3a]">
                  {featured.title}
                </h2>
                <p className="mt-3 text-base leading-7 text-[#4f6a72]">
                  {featured.excerpt}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#60777f]">
                  {featured.author || "TRI-P Tech"} - {formatDate(featured.updated_at || featured.created_at)}
                </p>
                <details className="mt-6 rounded-lg border border-[#d8e7e3] bg-[#fbfdfc] p-4">
                  <summary className="cursor-pointer text-sm font-bold text-[#082c3a]">
                    Read post
                  </summary>
                  <div className="mt-3 grid gap-3 text-sm leading-7 text-[#4f6a72]">
                    {bodyPreview(featured).map((paragraph, index) => (
                      <p key={`${featured.id}-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          </article>
        ) : null}

        {otherPosts.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {otherPosts.map((post) => (
              <article key={post.id} className="rounded-lg border border-[#d8e7e3] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#117865] hover:shadow-[0_16px_34px_rgba(17,120,101,0.14)]">
                {post.cover_image ? (
                  <div className="mb-4 flex h-48 items-center justify-center rounded-md bg-[#e9f5f2] p-3">
                    <img src={post.cover_image} alt="" className="max-h-full w-full object-contain" />
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#eef8f5] px-3 py-1 text-xs font-bold text-[#117865]">
                    {post.category}
                  </span>
                  <span className="text-xs font-semibold text-[#60777f]">
                    {formatDate(post.updated_at || post.created_at)}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-bold text-[#082c3a]">{post.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#60777f]">{post.excerpt}</p>
                <details className="mt-4 border-t border-[#edf4f2] pt-3">
                  <summary className="cursor-pointer text-sm font-bold text-[#082c3a]">
                    Read more
                  </summary>
                  <div className="mt-3 grid gap-3 text-sm leading-7 text-[#4f6a72]">
                    {bodyPreview(post).map((paragraph, index) => (
                      <p key={`${post.id}-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                </details>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
