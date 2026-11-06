import React from 'react';
import {createRoot} from 'react-dom/client';
import DataLab from './components/DataLab';
export function mountDataLab(node:HTMLElement,bridge:any){
 const root=createRoot(node);root.render(<DataLab bridge={bridge}/>);return()=>root.unmount();
}
