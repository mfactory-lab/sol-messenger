import{d as c,o as _,t as l,f as e,v as r,bk as u,bl as p,e as f,w as a,h as m,g,k as v,y as k}from"./vendor.74ebb7b4.js";import{_ as h}from"./index.036070ac.js";const x={class:"error-page"},y={class:"container"},B={class:"error-page__code"},b={class:"error-page__message"},C=c({__name:"ErrorContainer",props:{code:{type:Number,default:500},message:{type:String,default:"An unexpected error occurred"}},setup(t){return(o,d)=>(_(),l("div",x,[e("div",y,[e("div",B,r(t.code),1),e("div",b,r(t.message),1),u(o.$slots,"default",{},void 0,!0)])]))}});const N=h(C,[["__scopeId","data-v-d1645421"]]),$={class:"q-mt-lg"},E=c({__name:"[...all]",setup(t){const o=p();return(d,s)=>{const i=N;return _(),f(i,{code:404,message:"Page not found"},{default:a(()=>[e("div",$,[m(k,{rounded:"",onClick:s[0]||(s[0]=S=>v(o).back())},{default:a(()=>[g(" Back ")]),_:1})])]),_:1})}}}),n={};typeof n=="function"&&n(E);export{E as default};