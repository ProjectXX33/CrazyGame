-- Add a cover-image column to blog posts.
-- Run once in the Supabase SQL editor.

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS image_url text;

-- Cover images are uploaded through the existing product-images bucket
-- (the dashboard reuses the same uploader), so no new storage policy is needed.
