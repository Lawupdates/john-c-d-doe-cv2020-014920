"use strict";
const $ = id => document.getElementById(id);
const form=$("form"), input=$("question"), send=$("send"), googleButton=$("google-ai"), reset=$("reset"), progress=$("progress"), status=$("status"), messagesBox=$("conversation");
const modelName="HuggingFaceTB/SmolLM2-135M-Instruct";
const aiGuidance="You are a friendly general-purpose assistant for a public court-record archive. Answer everyday questions normally. Reply in the language of the user if supported. You have no direct access to the live internet or the full court PDFs. Do not claim to have researched the docket or count lawsuits without a verified dataset. Do not invent citations. Explain legal terms generally without personalized legal advice.";
let googleSession=null, cpuGenerator=null, conversation=[{role:"system",content:aiGuidance}], busy=false, mode="auto";
function updateStatus(s){status.textContent=s;}
function setBusy(value){busy=value;send.disabled=value;input.disabled=value;reset.disabled=value;googleButton.disabled=value||!("LanguageModel" in window);}
function bubble(who,content){const el=document.createElement("div");el.className="msg "+(who==="user"?"user":"ai");const label=document.createElement("strong");label.textContent=who==="user"?"You":"AI assistant";const p=document.createElement("p");p.textContent=content;el.append(label,p);messagesBox.append(el);messagesBox.scrollTop=messagesBox.scrollHeight;return p;}
function directAnswer(question){
 const s=question.trim().toLowerCase().replace(/\b(?:casae|casaes|caes)\b/g,"cases");
 if(/^(what(?:'s| is)? (?:the )?(?:today'?s? )?(?:date|day|time)|what (?:time|day|date) is it|current date|today'?s? date|que fecha es hoy|qué fecha es hoy|que hora es|qué hora es|fecha de hoy)[?!.\s]*$/.test(s)){
  const isSpanish=/^(que|qué|fecha)/.test(s);
  const wantTime=/time|hora/.test(s);
  const locale=isSpanish?"es-US":(navigator.language||"en-US");
  const options=wantTime?{dateStyle:"full",timeStyle:"short"}:{dateStyle:"full"};
  return (isSpanish?"Según la hora local de tu dispositivo: ":"According to your device’s local clock: ")+new Intl.DateTimeFormat(locale,options).format(new Date())+".";
 }
 if(/(how many|number of|cu[aá]ntos|cantidad de|total).{0,100}(sex(?:ual)? (?:abuse|assault)|abuso sexual).{0,90}(bbbsa|big brothers big sisters)|(bbbsa|big brothers big sisters).{0,90}(sex(?:ual)? (?:abuse|assault)|abuso sexual).{0,90}(cases|lawsuits|casos|demandas)/i.test(s)){
  const es=/cu[aá]ntos|abuso sexual|demandas/i.test(s);
  return es?"No hay un recuento nacional completo y verificado de demandas por abuso sexual contra Big Brothers Big Sisters of America que yo pueda confirmar aquí. Este archivo documenta un caso civil de Arizona, CV2020-014920, no todos los casos. Para comprobar otros casos, consulte registros judiciales públicos y distinga las demandas contra la organización nacional de las presentadas contra afiliadas locales. Consulte el índice de expedientes de este sitio y el registro oficial.":"I cannot give you a verified nationwide total of sexual-abuse lawsuits against Big Brothers Big Sisters of America (BBBSA). There is no comprehensive case count established by this website. This archive documents one Arizona civil case (CV2020-014920); that is NOT a count of all lawsuits. Counts would require checking court dockets across jurisdictions and distinguishing BBBSA from independently named local affiliates. Start with the court-record index here and official court dockets.";
 }
 return null;
}
async function prepareGoogle(){
 const API=window.LanguageModel;
 if(!API||typeof API.create!=="function"){throw Error("Google Chrome’s built-in Gemini Nano AI is not offered on this browser or computer.");}
 updateStatus("Checking Google Gemini Nano on this device…");
 const options={expectedInputs:[{type:"text",languages:["en","es"]}],expectedOutputs:[{type:"text",languages:["en","es"]}],initialPrompts:[{role:"system",content:aiGuidance}]};
 let availability;
 try{availability=await API.availability({expectedInputs:options.expectedInputs,expectedOutputs:options.expectedOutputs});}
 catch(e){availability="unknown";}
 if(availability==="unavailable"||availability==="no")throw Error("Google Gemini Nano is not supported on this device.");
 updateStatus(availability==="downloadable"||availability==="downloading"?"Chrome is downloading its local Google model. This may require free disk space and take time.":"Starting Google’s local AI…");
 try{
  googleSession=await API.create({...options,monitor(m){m.addEventListener("downloadprogress",e=>{if(Number.isFinite(e.loaded)){progress.hidden=false;progress.value=Math.round(e.loaded*100);updateStatus("Downloading Google’s local model: "+progress.value+"%");}});}});
 }catch(e){
  googleSession=await API.create({initialPrompts:[{role:"system",content:aiGuidance}]});
 }
 mode="google";progress.hidden=true;
 updateStatus("Google Gemini Nano is ready—free on-device, no sign-in.");
}
async function prepareCPU(){
 updateStatus("Downloading a free, smaller AI model to your browser. First load may use around 140 MB and responses can be slow on older devices.");
 progress.hidden=false;progress.removeAttribute("value");
 try{
  const {pipeline}=await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2");
  cpuGenerator=await pipeline("text-generation",modelName,{device:"wasm",dtype:"q8",progress_callback:p=>{
   if(p&&typeof p.progress==="number"){progress.value=p.progress;progress.max=100;updateStatus("Downloading free AI files: "+Math.round(p.progress)+"%");}
  }});
  mode="cpu";progress.hidden=true;
  updateStatus("Free local AI ready. No sign-in or API key.");
 }catch(err){
  progress.hidden=true;
  throw Error("Local AI could not download or initialize: "+(err?.message||"network or memory error"));
 }
}
function extract(result){
 if(!Array.isArray(result)||!result.length)return "";
 const val=result[0]?.generated_text??result[0]?.text??"";
 if(typeof val==="string")return val;
 if(Array.isArray(val))return String(val.filter(m=>m.role==="assistant").at(-1)?.content||"");
 return "";
}
async function answerWithAI(question){
 if(mode==="google"&&googleSession){
  try{return String(await googleSession.prompt(question));}
  catch(err){googleSession=null;mode="auto";updateStatus("Google AI stopped responding. Switching to the free browser model…");}
 }
 if(!cpuGenerator){
  if("LanguageModel" in window && !googleSession && !cpuGenerator && mode!=="cpu"){
   try{await prepareGoogle();return String(await googleSession.prompt(question));}
   catch(err){updateStatus("Google AI unavailable here. Switching to the free browser model…");googleSession=null;mode="auto";}
  }
  await prepareCPU();
 }
 const turns=[conversation[0],...conversation.slice(1).slice(-8),{role:"user",content:question}];
 const result=await cpuGenerator(turns,{max_new_tokens:220,do_sample:false,return_full_text:false});
 return extract(result);
}
googleButton.addEventListener("click",async()=>{
 if(busy)return;
 setBusy(true);
 try{await prepareGoogle();}
 catch(err){updateStatus("Google AI unavailable: "+(err?.message||"unsupported device")+". You can still send a question with the free local alternative.");}
 finally{progress.hidden=true;setBusy(false);input.focus();}
});
reset.addEventListener("click",()=>{
 if(busy)return;conversation=[{role:"system",content:aiGuidance}];messagesBox.replaceChildren();
 bubble("ai","Welcome! Ask your question in English or Spanish. No sign-in is required.");
 input.value="";updateStatus(mode==="google"?"Google Gemini Nano ready.":mode==="cpu"?"Free local AI ready.":"Ready. Ask a question. AI model download is needed only for open-ended questions.");input.focus();
});
form.addEventListener("submit",async event=>{
 event.preventDefault();if(busy)return;const question=input.value.trim();if(!question)return;
 setBusy(true);bubble("user",question);const reply=bubble("ai","Thinking…");updateStatus("Answering…");
 try{
  let answer=directAnswer(question);
  if(!answer)answer=await answerWithAI(question);
  if(!answer||!answer.trim())throw Error("The model returned an empty answer.");
  reply.textContent=answer.trim();
  conversation.push({role:"user",content:question},{role:"assistant",content:answer.trim()});
  if(conversation.length>11)conversation=[conversation[0],...conversation.slice(-10)];
  input.value="";
  updateStatus(mode==="google"?"Google Gemini Nano ready.":mode==="cpu"?"Local AI ready.":"Ready.");
 }catch(err){
  reply.textContent="The AI could not answer this question on this device. "+(err?.message||"Please try again.")+" You can still read the original court records from this website.";
  updateStatus("No sign-in required. Check your internet connection and available device memory, then retry.");
 }finally{progress.hidden=true;setBusy(false);input.focus();}
});
if(!("LanguageModel" in window)){googleButton.disabled=true;googleButton.title="Chrome’s Google Gemini Nano AI is not installed or supported on this device.";}
