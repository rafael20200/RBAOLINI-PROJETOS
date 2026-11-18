(() => {
  const client = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
  const $ = id => document.getElementById(id);
  const loginPanel = $('loginPanel'), dashboard = $('dashboard');
  let busy = false;
  const msg = (id, text, error=false) => { $(id).textContent=text; $(id).className='small mt-3 '+(error?'text-danger':'text-success'); };
  async function showSession(session) {
    if (busy) return; busy=true;
    try {
      if (!session?.user) { loginPanel.classList.remove('d-none'); dashboard.classList.add('d-none'); return; }
      const { data: allowed, error } = await client.rpc('is_portfolio_admin');
      if (error || allowed !== true) {
        await client.auth.signOut();
        msg('loginMessage','Usuário autenticado, mas ainda não está autorizado como administrador. Confira o cadastro em admin_users.',true);
        return;
      }
      loginPanel.classList.add('d-none'); dashboard.classList.remove('d-none'); await loadProjects();
    } finally { busy=false; }
  }
  $('loginForm').addEventListener('submit', async e => {
    e.preventDefault(); msg('loginMessage','Validando acesso...');
    const { data, error }=await client.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});
    if(error) return msg('loginMessage',error.message,true);
    await showSession(data.session);
  });
  $('logoutBtn').addEventListener('click', async()=>{await client.auth.signOut();loginPanel.classList.remove('d-none');dashboard.classList.add('d-none');});
  $('cancelEdit').addEventListener('click',resetForm); $('refreshBtn').addEventListener('click',loadProjects);
  function resetForm(){ $('projectForm').reset();$('projectId').value='';$('displayOrder').value='0';$('formTitle').textContent='Adicionar projeto';msg('formMessage',''); }
  async function loadProjects(){
    const {data,error}=await client.from('projects').select('*').order('display_order').order('created_at',{ascending:false});
    const list=$('projectsList');list.replaceChildren();
    if(error){list.textContent='Falha ao carregar: '+error.message;return;}
    if(!data?.length){list.textContent='Nenhum projeto cadastrado.';return;}
    data.forEach(p=>{
      const row=document.createElement('div');row.className='project-row d-flex flex-wrap justify-content-between align-items-center gap-3';
      const info=document.createElement('div');info.className='flex-grow-1';
      const title=document.createElement('strong');title.textContent=p.title;
      const meta=document.createElement('div');meta.className='small muted';meta.textContent=(p.category||'Projeto')+' • '+(p.published?'Publicado':'Rascunho');info.append(title,meta);
      const actions=document.createElement('div');actions.className='d-flex gap-2';
      const edit=document.createElement('button');edit.className='btn btn-sm btn-outline-dark';edit.textContent='Editar';edit.onclick=()=>editProject(p);
      const del=document.createElement('button');del.className='btn btn-sm btn-outline-danger';del.textContent='Excluir';del.onclick=()=>deleteProject(p);
      actions.append(edit,del);row.append(info,actions);list.append(row);
    });
  }
  function editProject(p){
    $('projectId').value=p.id;$('title').value=p.title;$('description').value=p.description;$('category').value=p.category||'';
    $('technologies').value=(p.technologies||[]).join(', ');$('videoUrl').value=p.video_url||'';$('projectUrl').value=p.project_url||'';
    $('displayOrder').value=p.display_order||0;$('published').checked=p.published;$('formTitle').textContent='Editar projeto';window.scrollTo({top:0,behavior:'smooth'});
  }
  async function deleteProject(p){
    if(!confirm('Excluir o projeto “'+p.title+'”?'))return;
    const {error}=await client.from('projects').delete().eq('id',p.id);
    if(error)return msg('formMessage',error.message,true);await loadProjects();msg('formMessage','Projeto excluído.');
  }
  const safeName=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]/g,'-');
  $('projectForm').addEventListener('submit',async e=>{
    e.preventDefault();msg('formMessage','Salvando...');
    const id=$('projectId').value,file=$('image').files[0];let imageUrl=null;
    if(file){
      if(!['image/jpeg','image/png','image/webp'].includes(file.type))return msg('formMessage','Use imagem JPG, PNG ou WebP.',true);
      if(file.size>5*1024*1024)return msg('formMessage','A imagem deve ter no máximo 5 MB.',true);
      const path=Date.now()+'-'+safeName(file.name);const up=await client.storage.from('project-images').upload(path,file,{contentType:file.type});
      if(up.error)return msg('formMessage','Erro no upload: '+up.error.message,true);
      imageUrl=client.storage.from('project-images').getPublicUrl(path).data.publicUrl;
    }
    const payload={title:$('title').value.trim(),description:$('description').value.trim(),category:$('category').value.trim()||'Projeto',
      technologies:$('technologies').value.split(',').map(s=>s.trim()).filter(Boolean),video_url:$('videoUrl').value.trim()||null,
      project_url:$('projectUrl').value.trim()||null,published:$('published').checked,display_order:Number($('displayOrder').value)||0,updated_at:new Date().toISOString()};
    if(imageUrl)payload.image_url=imageUrl;
    const result=id?await client.from('projects').update(payload).eq('id',id):await client.from('projects').insert(payload);
    if(result.error)return msg('formMessage',result.error.message,true);
    resetForm();await loadProjects();msg('formMessage','Projeto salvo com sucesso.');
  });
  client.auth.getSession().then(({data})=>showSession(data.session));
  client.auth.onAuthStateChange((_event,session)=>{if(!session){loginPanel.classList.remove('d-none');dashboard.classList.add('d-none');}});
})();
