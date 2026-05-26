import app from './src/app.js';
import { env } from './src/config/env.js';
import { supabaseAdmin } from './src/config/supabase.js';

async function ensureBuckets() {
  const defs = [
    { name: 'avatars',     isPublic: true  },
    { name: 'resumes',     isPublic: false },
    { name: 'item-images', isPublic: true  },
  ];
  for (const { name, isPublic } of defs) {
    const { data } = await supabaseAdmin.storage.getBucket(name);
    if (!data) {
      const { error } = await supabaseAdmin.storage.createBucket(name, { public: isPublic });
      if (error) console.warn(`[Storage] Could not create bucket "${name}": ${error.message}`);
      else       console.log(`[Storage] Created bucket "${name}" (public=${isPublic})`);
    } else if (data.public !== isPublic) {
      await supabaseAdmin.storage.updateBucket(name, { public: isPublic });
      console.log(`[Storage] Updated bucket "${name}" to public=${isPublic}`);
    }
  }
}

ensureBuckets().catch(e => console.warn('[Storage] Bucket init error:', e.message));

app.listen(env.PORT, () => {
  console.log(`[TeamUp API] Running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});
