import { createClient } from '@supabase/supabase-js';

const url = 'https://pzdtpciqocmqejiuiqhg.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZHRwY2lxb2NtcWVqaXVpcWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDY4NDAsImV4cCI6MjA5NTM4Mjg0MH0.jcGj_pdod30Fw8C9Joo4AdSTE-3JUlSgv_8Cvad6PFU';

const supabase = createClient(url, key);

async function checkData() {
  const { data: repasses, error: err1 } = await supabase.from('repasses').select('*');
  console.log('Repasses:', repasses?.length, err1);

  const { data: mais_saude, error: err2 } = await supabase.from('mais_saude').select('*');
  console.log('Mais Saúde:', mais_saude?.length, err2);

  const { data: downloads, error: err3 } = await supabase.from('downloads').select('*');
  console.log('Downloads:', downloads?.length, err3);
}

checkData();
