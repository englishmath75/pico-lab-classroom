export function pngBytes(src:string):Uint8Array {
 if(src.length>2800000||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(src))throw Error('유효한 PNG 데이터가 아닙니다.');
 const bytes=Uint8Array.from(atob(src.split(',')[1]),c=>c.charCodeAt(0));
 if(bytes.length<33||![137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)||String.fromCharCode(...bytes.slice(12,16))!=='IHDR')throw Error('PNG 헤더 검증 실패');
 return bytes;
}
