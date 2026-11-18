(() => {
 const client=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY);
 const container=document.querySelector('main .container > .row.g-4'); if(!container)return;
 client.from('projects').select('id,title,description,technologies,category,image_url,video_url,project_url,display_order').eq('published',true).order('display_order').order('created_at',{ascending:false}).then(({data,error})=>{
  if(error||!data?.length)return; // preserva os cards antigos como alternativa se ainda não houver cadastro
  container.replaceChildren();
  data.forEach(p=>{
   const col=document.createElement('div');col.className='col-md-6 col-xl-4';const card=document.createElement('article');card.className='project-card h-100';
   if(p.image_url){const img=document.createElement('img');img.src=p.image_url;img.alt=p.title;img.loading='lazy';img.className='w-100';img.style.cssText='height:190px;object-fit:cover';card.append(img);}else{const art=document.createElement('div');art.className='project-art';art.innerHTML='<i class="bi bi-code-square"></i>';card.append(art);}
   const body=document.createElement('div');body.className='project-body';const cat=document.createElement('span');cat.className='section-kicker';cat.textContent=p.category||'Projeto';const title=document.createElement('h3');title.className='mt-2';title.textContent=p.title;const desc=document.createElement('p');desc.textContent=p.description;const tech=document.createElement('p');tech.className='small text-secondary';tech.textContent=(p.technologies||[]).join(' • ');body.append(cat,title,desc,tech);
   for(const [url,label] of [[p.project_url,'Acessar projeto'],[p.video_url,'Ver vídeo']])if(url){const a=document.createElement('a');a.className='btn btn-outline-dark btn-sm rounded-pill px-3 me-2';a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=label;body.append(a);}
   card.append(body);col.append(card);container.append(col);
  });
 });
})();
