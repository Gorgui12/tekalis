#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");
const CSV_PATH = path.join(REPO_ROOT, "SOLAR_DATA_TO_FILL.csv");
const args = process.argv.slice(2);
const DO_APPLY = args.includes("--apply");
const DRY_RUN = !DO_APPLY || args.includes("--dry-run");
function parseCsv(text){const lines=text.replace(/\r\n/g,"\n").split("\n");if(!lines.length)return{headers:[],rows:[]};const headers=lines[0].split(",").map(h=>h.trim());const rows=[];for(let i=1;i<lines.length;i++){const l=lines[i];if(!l.trim())continue;const cols=[];let cur="";let inQ=false;for(let j=0;j<l.length;j++){const c=l[j];if(c==='"'){inQ=!inQ;continue;}if(c===","&&!inQ){cols.push(cur);cur="";continue;}cur+=c;}cols.push(cur);const r={};headers.forEach((h,idx)=>r[h]=cols[idx]??"");rows.push(r);}return{headers,rows};}
const FIELD_ORDER=["role","powerW","voltageV","capacityAh","chemistry","inverterContinuousW","inverterPeakW","systemVoltageV","inverterType","mpptMaxVocV","mpptMaxA","panelVocV","panelVmpV","cycles"];
function toNum(v){if(v===""||v==null)return undefined;const n=Number(v);return Number.isFinite(n)?n:undefined;}
function toSolarObj(row){const s={};for(const f of FIELD_ORDER){const v=row[f];if(v===""||v==null)continue;if(f==="role"||f==="chemistry"||f==="inverterType"){s[f]=v;continue;}const n=toNum(v);if(n!==undefined)s[f]=n;}return Object.keys(s).length?s:null;}
function main(){if(!fs.existsSync(CSV_PATH)){console.error("CSV missing");process.exit(1);}const csv=fs.readFileSync(CSV_PATH,"utf8");const {rows}=parseCsv(csv);console.log("rows="+rows.length+" dry="+DRY_RUN);let t=0,s=0;for(const r of rows){const slug=(r.slug||"").trim();if(!slug){s++;continue;}const so=toSolarObj(r);if(!so){s++;continue;}t++;if(DRY_RUN)console.log(slug+":"+JSON.stringify(so));}console.log("t="+t+" s="+s);}
main();
