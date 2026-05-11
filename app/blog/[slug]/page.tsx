import { notFound } from "next/navigation";
import { getPost, posts } from "../posts";
import { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";

const BASE_URL = "https://orchesis.ai";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not Found" };

  const url = `${BASE_URL}/blog/${slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      siteName: "Orchesis",
      publishedTime: post.date,
      authors: ["Pavel"],
      images: [{ url: `${BASE_URL}/api/og`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`${BASE_URL}/api/og`],
    },
  };
}

export function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "author": { "@type": "Person", "name": "Pavel", "url": `${BASE_URL}/about` },
    "publisher": {
      "@type": "Organization",
      "name": "Orchesis",
      "logo": { "@type": "ImageObject", "url": `${BASE_URL}/images/logo.png` },
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "mainEntityOfPage": `${BASE_URL}/blog/${post.slug}`,
    "url": `${BASE_URL}/blog/${post.slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `${BASE_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogPostClient post={post} />
    </>
  );
}
