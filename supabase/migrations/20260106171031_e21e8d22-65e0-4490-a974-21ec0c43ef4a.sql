-- Make palm-images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'palm-images';

-- Drop the public read policy
DROP POLICY IF EXISTS "Palm images are publicly readable" ON storage.objects;