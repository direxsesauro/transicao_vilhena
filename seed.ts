import { createClient } from '@supabase/supabase-js';
import { INITIAL_REPASSES, INITIAL_MAIS_SAUDE, INITIAL_DOWNLOADS } from './src/mockData';

const url = 'https://pzdtpciqocmqejiuiqhg.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZHRwY2lxb2NtcWVqaXVpcWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDY4NDAsImV4cCI6MjA5NTM4Mjg0MH0.jcGj_pdod30Fw8C9Joo4AdSTE-3JUlSgv_8Cvad6PFU';

const supabase = createClient(url, key);

async function seed() {
  console.log('Seeding repasses...');
  const repassesData = INITIAL_REPASSES.map(({ id, ...rest }) => rest);
  await supabase.from('repasses').insert(repassesData);

  console.log('Seeding mais saude...');
  const maisSaudeData = INITIAL_MAIS_SAUDE.map(({ id, ...rest }) => rest);
  await supabase.from('mais_saude').insert(maisSaudeData);

  console.log('Seeding downloads...');
  const downloadsData = INITIAL_DOWNLOADS.map(({ id, content_base64, ...rest }) => rest);
  await supabase.from('downloads').insert(downloadsData);

  console.log('Seeding completed!');
}

seed();
