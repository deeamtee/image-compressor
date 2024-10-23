import pako from 'pako';

var UPNG = (function() {
	
	const _bin = {
		nextZero: (data, p) => {
		  while (data[p] !== 0) p++;
		  return p;
		},
		readUshort: (buff, p) => (buff[p] << 8) | buff[p + 1],
		writeUshort: (buff, p, n) => {
		  buff[p] = (n >> 8) & 255;
		  buff[p + 1] = n & 255;
		},
		readUint: (buff, p) =>
		  buff[p] * (256 ** 3) + ((buff[p + 1] << 16) | (buff[p + 2] << 8) | buff[p + 3]),
		writeUint: (buff, p, n) => {
		  buff[p] = (n >> 24) & 255;
		  buff[p + 1] = (n >> 16) & 255;
		  buff[p + 2] = (n >> 8) & 255;
		  buff[p + 3] = n & 255;
		},
		readASCII: (buff, p, l) => {
		  let s = "";
		  for (let i = 0; i < l; i++) s += String.fromCharCode(buff[p + i]);
		  return s;
		},
		writeASCII: (data, p, s) => {
		  for (let i = 0; i < s.length; i++) data[p + i] = s.charCodeAt(i);
		},
		readBytes: (buff, p, l) => {
		  const arr = [];
		  for (let i = 0; i < l; i++) arr.push(buff[p + i]);
		  return arr;
		},
		pad: (n) => (n.length < 2 ? "0" + n : n),
		readUTF8: (buff, p, l) => {
		  let s = "";
		  for (let i = 0; i < l; i++) s += "%" + _bin.pad(buff[p + i].toString(16));
		  try {
			return decodeURIComponent(s);
		  } catch (e) {
			return _bin.readASCII(buff, p, l);
		  }
		}
	  };
	  

	  function toRGBA8(imageData) {
		const { width, height, frames, tabs } = imageData;
	
		// Если нет анимации, просто декодируем изображение и возвращаем его.
		if (!tabs.acTL) {
			return [decodeImage(imageData.data, width, height, imageData).buffer];
		}
	
		const decodedFrames = [];
		
		// Инициализируем первый кадр, если данных нет.
		if (!frames[0].data) frames[0].data = imageData.data;
	
		const totalPixels = width * height * 4; // Количество пикселей * 4 (RGBA)
		let currentFrameBuffer = new Uint8Array(totalPixels);
		let emptyFrameBuffer = new Uint8Array(totalPixels);
		let previousFrameBuffer = new Uint8Array(totalPixels);
	
		frames.forEach((frame, index) => {
			const { rect, blend, dispose, data: frameData } = frame;
			const { x: frameX, y: frameY, width: frameWidth, height: frameHeight } = rect;
	
			const decodedFrame = decodeImage(frameData, frameWidth, frameHeight, imageData);
	
			// Копируем предыдущий кадр, если это не первый
			if (index !== 0) {
				previousFrameBuffer.set(currentFrameBuffer);
			}
	
			// Копируем данные кадра в зависимости от режима смешивания
			if (blend === 0) {
				copyTile(decodedFrame, frameWidth, frameHeight, currentFrameBuffer, width, height, frameX, frameY, false);
			} else if (blend === 1) {
				copyTile(decodedFrame, frameWidth, frameHeight, currentFrameBuffer, width, height, frameX, frameY, true);
			}
	
			decodedFrames.push(currentFrameBuffer.slice());
	
			// Управляем очисткой кадра в зависимости от метода удаления
			if (dispose === 1) {
				// Очистить область кадра
				copyTile(emptyFrameBuffer, frameWidth, frameHeight, currentFrameBuffer, width, height, frameX, frameY, false);
			} else if (dispose === 2) {
				// Восстановить предыдущий кадр
				currentFrameBuffer.set(previousFrameBuffer);
			}
		});
	
		return decodedFrames;
	}
	
	function decodeImage(data, width, height, imageData) {
		const totalPixels = width * height;
		const bitsPerPixel = getBitsPerPixel(imageData);
		const bytesPerRow = Math.ceil((width * bitsPerPixel) / 8); // байтов на строку
	
		const rgbaBuffer = new Uint8Array(totalPixels * 4); // буфер для RGBA
		const rgbaBuffer32 = new Uint32Array(rgbaBuffer.buffer); // для быстрого присвоения 32-битными словами
	
		const { ctype: colorType, depth, tabs } = imageData;
		const transparencyData = tabs.tRNS;
		const palette = tabs.PLTE;
	
		if (colorType === 6) {
			// RGB с альфа-каналом
			if (depth === 8) {
				for (let i = 0; i < totalPixels * 4; i++) {
					rgbaBuffer[i] = data[i];
				}
			} else if (depth === 16) {
				for (let i = 0; i < totalPixels * 4; i++) {
					rgbaBuffer[i] = data[i * 2]; // 16-битное значение
				}
			}
		} else if (colorType === 2) {
			// RGB без альфа
			if (!transparencyData) {
				if (depth === 8) {
					for (let i = 0; i < totalPixels; i++) {
						rgbaBuffer32[i] = (255 << 24) | (data[i * 3 + 2] << 16) | (data[i * 3 + 1] << 8) | data[i * 3];
					}
				} else if (depth === 16) {
					for (let i = 0; i < totalPixels; i++) {
						rgbaBuffer32[i] = (255 << 24) | (data[i * 6 + 4] << 16) | (data[i * 6 + 2] << 8) | data[i * 6];
					}
				}
			} else {
				const [transparentRed, transparentGreen, transparentBlue] = transparencyData;
				if (depth === 8) {
					for (let i = 0; i < totalPixels; i++) {
						const [red, green, blue] = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
						const alpha = (red === transparentRed && green === transparentGreen && blue === transparentBlue) ? 0 : 255;
						rgbaBuffer32[i] = (alpha << 24) | (blue << 16) | (green << 8) | red;
					}
				} else if (depth === 16) {
					for (let i = 0; i < totalPixels; i++) {
						const [red, green, blue] = [data[i * 6], data[i * 6 + 2], data[i * 6 + 4]];
						const alpha = (readUShort(data, i * 6) === transparentRed && readUShort(data, i * 6 + 2) === transparentGreen && readUShort(data, i * 6 + 4) === transparentBlue) ? 0 : 255;
						rgbaBuffer32[i] = (alpha << 24) | (blue << 16) | (green << 8) | red;
					}
				}
			}
		} else if (colorType === 3) {
			// Палитра
			const alphaPalette = transparencyData || [];
			const alphaPaletteLength = alphaPalette.length;
	
			for (let i = 0; i < totalPixels; i++) {
				const paletteIndex = data[i];
				const [r, g, b] = [palette[paletteIndex * 3], palette[paletteIndex * 3 + 1], palette[paletteIndex * 3 + 2]];
				const alpha = paletteIndex < alphaPaletteLength ? alphaPalette[paletteIndex] : 255;
				rgbaBuffer32[i] = (alpha << 24) | (b << 16) | (g << 8) | r;
			}
		} else if (colorType === 4) {
			// Градации серого с альфа
			if (depth === 8) {
				for (let i = 0; i < totalPixels; i++) {
					const gray = data[i * 2];
					rgbaBuffer32[i] = (data[i * 2 + 1] << 24) | (gray << 16) | (gray << 8) | gray;
				}
			} else if (depth === 16) {
				for (let i = 0; i < totalPixels; i++) {
					const gray = data[i * 4];
					rgbaBuffer32[i] = (data[i * 4 + 2] << 24) | (gray << 16) | (gray << 8) | gray;
				}
			}
		} else if (colorType === 0) {
			// Градации серого
			const transparentGray = transparencyData ? transparencyData[0] : -1;
	
			for (let y = 0; y < height; y++) {
				const rowStartIndex = y * width;
				for (let x = 0; x < width; x++) {
					let gray = 0;
					if (depth === 1) {
						gray = 255 * ((data[rowStartIndex + (x >> 3)] >> (7 - (x % 8))) & 1);
					} else if (depth === 2) {
						gray = 85 * ((data[rowStartIndex + (x >> 2)] >> (6 - ((x % 4) * 2))) & 3);
					} else if (depth === 4) {
						gray = 17 * ((data[rowStartIndex + (x >> 1)] >> (4 - ((x % 2) * 4))) & 15);
					} else if (depth === 8) {
						gray = data[rowStartIndex + x];
					} else if (depth === 16) {
						gray = data[rowStartIndex + (x * 2)];
					}
	
					const alpha = gray === transparentGray * 255 ? 0 : 255;
					rgbaBuffer32[rowStartIndex + x] = (alpha << 24) | (gray << 16) | (gray << 8) | gray;
				}
			}
		}
	
		return rgbaBuffer;
	}
	
	function decode(buffer) {
		const data = new Uint8Array(buffer);
		let offset = 8; // Начинаем с 8 байта (пропускаем заголовок PNG)
		const bin = _bin;
		const readUshort = bin.readUshort;
		const readUint = bin.readUint;
	
		const output = { tabs: {}, frames: [] }; // Основной объект для выходных данных
		const idatData = new Uint8Array(data.length); // Для хранения всех IDAT данных
		let idatOffset = 0; // Смещение для IDAT
		let frameData; // Хранит данные кадров
		let frameOffset = 0; // Смещение для кадров
	
		// Проверка заголовка PNG
		const pngHeader = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
		for (let i = 0; i < pngHeader.length; i++) {
			if (data[i] !== pngHeader[i]) throw new Error("The input is not a PNG file!");
		}
	
		// Обработка каждого чанка
		while (offset < data.length) {
			const chunkLength = readUint(data, offset); 
			offset += 4; // Пропускаем длину
			const chunkType = bin.readASCII(data, offset, 4);
			offset += 4; // Пропускаем тип
	
			switch (chunkType) {
				case "IHDR":
					_IHDR(data, offset, output);
					break;
	
				case "iCCP":
					handleICCProfile(data, offset, chunkLength, output, bin);
					break;
	
				case "CgBI":
					output.tabs[chunkType] = data.slice(offset, offset + 4);
					break;
	
				case "IDAT":
					copyIdatData(data, offset, chunkLength, idatData, idatOffset);
					idatOffset += chunkLength;
					break;
	
				case "acTL":
					handleAnimationControl(data, offset, output);
					frameData = new Uint8Array(data.length);
					break;
	
				case "fcTL":
					handleFrameControl(data, offset, output, frameData, frameOffset);
					frameOffset = 0; // Сброс смещения для кадров
					break;
	
				case "fdAT":
					copyFrameData(data, offset, chunkLength, frameData, frameOffset);
					frameOffset += chunkLength - 4; // Вычитаем 4, так как fdAT содержит длину
					break;
	
				case "pHYs":
					output.tabs[chunkType] = [
						readUint(data, offset),
						readUint(data, offset + 4),
						data[offset + 8],
					];
					break;
	
				case "cHRM":
					output.tabs[chunkType] = readChunkData(data, offset, chunkLength, readUint);
					break;
	
				case "tEXt":
				case "zTXt":
					handleTextChunks(data, offset, chunkLength, output, bin, chunkType);
					break;
	
				case "iTXt":
					handleInternationalTextChunk(data, offset, chunkLength, output, bin);
					break;
	
				case "PLTE":
					output.tabs[chunkType] = bin.readBytes(data, offset, chunkLength);
					break;
	
				case "hIST":
					handleHistogram(data, offset, output);
					break;
	
				case "tRNS":
					handleTransparency(data, offset, chunkLength, output);
					break;
	
				case "gAMA":
					output.tabs[chunkType] = readUint(data, offset) / 100000;
					break;
	
				case "sRGB":
					output.tabs[chunkType] = data[offset];
					break;
	
				case "bKGD":
					handleBackgroundColor(data, offset, output);
					break;
	
				case "IEND":
					break;
	
				default:
					// Неизвестный тип чанка (возможно, его стоит логировать)
					// console.log("unknown chunk type", chunkType, chunkLength);
					output.tabs[chunkType] = data.slice(offset, offset + chunkLength);
					break;
			}
	
			offset += chunkLength; // Переход к следующему чанку
			const crc = readUint(data, offset); // Чтение CRC (не используется)
			offset += 4; // Пропускаем CRC
		}
	
		// Завершение последнего кадра, если необходимо
		if (frameOffset !== 0) {
			const lastFrame = output.frames[output.frames.length - 1];
			lastFrame.data = _decompress(output, frameData.slice(0, frameOffset), lastFrame.rect.width, lastFrame.rect.height);
		}
	
		output.data = _decompress(output, idatData, output.width, output.height);
		
		// Удаление неиспользуемых свойств
		delete output.compress;
		delete output.interlace;
		delete output.filter;
	
		return output;
	}
	
	// Обработчики для различных типов чанков
	function handleICCProfile(data, offset, length, output, bin) {
		let profileOffset = offset;
		while (data[profileOffset] !== 0) profileOffset++;
		const name = bin.readASCII(data, offset, profileOffset - offset);
		const compressionMethod = data[profileOffset + 1];
		const profileData = data.slice(profileOffset + 2, offset + length);
		let result;
		try {
			result = _inflate(profileData);
		} catch (e) {
			result = inflateRaw(profileData);
		}
		output.tabs["iCCP"] = result;
	}
	
	function copyIdatData(data, offset, length, idatData, idatOffset) {
		for (let i = 0; i < length; i++) {
			idatData[idatOffset + i] = data[offset + i];
		}
	}
	
	function handleAnimationControl(data, offset, output) {
		output.tabs["acTL"] = {
			num_frames: readUint(data, offset),
			num_plays: readUint(data, offset + 4),
		};
	}
	
	function handleFrameControl(data, offset, output, frameData, frameOffset) {
		if (frameOffset !== 0) {
			const lastFrame = output.frames[output.frames.length - 1];
			lastFrame.data = _decompress(output, frameData.slice(0, frameOffset), lastFrame.rect.width, lastFrame.rect.height);
		}
	
		const rectangle = {
			x: readUint(data, offset + 12),
			y: readUint(data, offset + 16),
			width: readUint(data, offset + 4),
			height: readUint(data, offset + 8),
		};
		const delay = Math.round(readUshort(data, offset + 20) / (readUshort(data, offset + 22) || 100) * 1000);
		const frame = {
			rect: rectangle,
			delay: delay,
			dispose: data[offset + 24],
			blend: data[offset + 25],
		};
		output.frames.push(frame);
	}
	
	function copyFrameData(data, offset, length, frameData, frameOffset) {
		for (let i = 0; i < length - 4; i++) {
			frameData[frameOffset + i] = data[offset + i + 4];
		}
	}
	
	function readChunkData(data, offset, length, readFn) {
		const chunkData = [];
		for (let i = 0; i < length / 4; i++) {
			chunkData.push(readFn(data, offset + i * 4));
		}
		return chunkData;
	}
	
	function handleTextChunks(data, offset, length, output, bin, chunkType) {
		if (output.tabs[chunkType] == null) output.tabs[chunkType] = {};
		const zeroIndex = bin.nextZero(data, offset);
		const keyword = bin.readASCII(data, offset, zeroIndex - offset);
		const textLength = offset + length - zeroIndex - 1;
		let text;
	
		if (chunkType === "tEXt") {
			text = bin.readASCII(data, zeroIndex + 1, textLength);
		} else {
			const compressedData = _inflate(data.slice(zeroIndex + 2, zeroIndex + 2 + textLength));
			text = bin.readUTF8(compressedData, 0, compressedData.length);
		}
	
		output.tabs[chunkType][keyword] = text;
	}
	
	function handleInternationalTextChunk(data, offset, length, output, bin) {
		if (output.tabs["iTXt"] == null) output.tabs["iTXt"] = {};
		let zeroIndex = 0;
		let currentOffset = offset;
	
		zeroIndex = bin.nextZero(data, currentOffset);
		const keyword = bin.readASCII(data, currentOffset, zeroIndex - currentOffset);
		currentOffset = zeroIndex + 1;
	
		const compressionFlag = data[currentOffset];
		const compressionMethod = data[currentOffset + 1];
		currentOffset += 2;
	
		zeroIndex = bin.nextZero(data, currentOffset);
		const languageTag = bin.readASCII(data, currentOffset, zeroIndex - currentOffset);
		currentOffset = zeroIndex + 1;
	
		zeroIndex = bin.nextZero(data, currentOffset);
		const translatedKeyword = bin.readUTF8(data, currentOffset, zeroIndex - currentOffset);
		currentOffset = zeroIndex + 1;
	
		const textLength = offset + length - currentOffset;
		let text;
		if (compressionFlag) {
			const compressedData = _inflate(data.slice(currentOffset, currentOffset + textLength));
			text = bin.readUTF8(compressedData, 0, compressedData.length);
		} else {
			text = bin.readASCII(data, currentOffset, textLength);
		}
	
		output.tabs["iTXt"][keyword] = {
			languageTag: languageTag,
			translatedKeyword: translatedKeyword,
			text: text,
		};
	}
	
	function handleHistogram(data, offset, output) {
		output.tabs["hIST"] = [];
		for (let i = 0; i < data.length - offset; i += 2) {
			output.tabs["hIST"].push(readUshort(data, offset + i));
		}
	}
	
	function handleTransparency(data, offset, length, output) {
		const alphaLength = length === 6 ? output.tabs.PLTE.length : length;
		output.tabs["tRNS"] = new Uint8Array(alphaLength);
		for (let i = 0; i < alphaLength; i++) {
			output.tabs["tRNS"][i] = data[offset + i];
		}
	}
	
	function handleBackgroundColor(data, offset, output) {
		if (data.length === 6) {
			output.tabs["bKGD"] = {
				index: data[offset],
			};
		} else {
			output.tabs["bKGD"] = {
				r: data[offset],
				g: data[offset + 1],
				b: data[offset + 2],
			};
		}
	}
	

	function _decompress(out, dd, w, h) {
		var bpp = _getBPP(out), bpl = Math.ceil(w*bpp/8), buff = new Uint8Array((bpl+1+out.interlace)*h);
		if(out.tabs["CgBI"]) dd = inflateRaw(dd,buff);
		else                 dd = _inflate(dd,buff);

		if     (out.interlace==0) dd = _filterZero(dd, out, 0, w, h);
		else if(out.interlace==1) dd = _readInterlace(dd, out);
		return dd;
	}

	function _inflate(data, buff) {  var out=inflateRaw(new Uint8Array(data.buffer, 2,data.length-6),buff);  return out;  }
	
	var inflateRaw=function(){var D=function(){var o=Uint16Array,j=Uint32Array;return{m:new o(16),v:new o(16),
	d:[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],o:[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,999,999,999],
	z:[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0],B:new o(32),
	p:[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,65535,65535],
	w:[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0],h:new j(32),g:new o(512),s:[],A:new o(32),t:[],k:new o(32768),c:[],
	a:[],n:new o(32768),e:[],C:new o(512),b:[],i:new o(1<<15),r:new j(286),f:new j(30),l:new j(19),u:new j(15e3),q:new o(1<<16),j:new o(1<<15)}}();
function C(o,j){var I=o.length,A,r,i,y,G,f=D.v;for(var y=0;y<=j;y++)f[y]=0;for(y=1;y<I;y+=2)f[o[y]]++;
var a=D.m;A=0;f[0]=0;for(r=1;r<=j;r++){A=A+f[r-1]<<1;a[r]=A}for(i=0;i<I;i+=2){G=o[i+1];if(G!=0){o[i]=a[G];
a[G]++}}}function t(o,j,I){var A=o.length,r=D.i;for(var i=0;i<A;i+=2)if(o[i+1]!=0){var y=i>>1,G=o[i+1],f=y<<4|G,a=j-G,k=o[i]<<a,N=k+(1<<a);
while(k!=N){var x=r[k]>>>15-j;I[x]=f;k++}}}function g(o,j){var I=D.i,A=15-j;for(var r=0;r<o.length;r+=2){var i=o[r]<<j-o[r+1];
o[r]=I[i]>>>A}}(function(){var o=1<<15;for(var j=0;j<o;j++){var I=j;I=(I&2863311530)>>>1|(I&1431655765)<<1;
I=(I&3435973836)>>>2|(I&858993459)<<2;I=(I&4042322160)>>>4|(I&252645135)<<4;I=(I&4278255360)>>>8|(I&16711935)<<8;
D.i[j]=(I>>>16|I<<16)>>>17}function A(r,i,y){while(i--!=0)r.push(0,y)}for(var j=0;j<32;j++){D.B[j]=D.o[j]<<3|D.z[j];
D.h[j]=D.p[j]<<4|D.w[j]}A(D.s,144,8);A(D.s,255-143,9);A(D.s,279-255,7);A(D.s,287-279,8);C(D.s,9);t(D.s,9,D.g);
g(D.s,9);A(D.t,32,5);C(D.t,5);t(D.t,5,D.A);g(D.t,5);A(D.b,19,0);A(D.c,286,0);A(D.e,30,0);A(D.a,320,0)}());
function F(o,j,I){return(o[j>>>3]|o[(j>>>3)+1]<<8)>>>(j&7)&(1<<I)-1}function s(o,j,I){return(o[j>>>3]|o[(j>>>3)+1]<<8|o[(j>>>3)+2]<<16)>>>(j&7)&(1<<I)-1}
function w(o,j){return(o[j>>>3]|o[(j>>>3)+1]<<8|o[(j>>>3)+2]<<16)>>>(j&7)}function b(o,j){return(o[j>>>3]|o[(j>>>3)+1]<<8|o[(j>>>3)+2]<<16|o[(j>>>3)+3]<<24)>>>(j&7)}
function v(o,j){var I=Uint8Array,r=0,i=0,y=0,G=0,f=0,a=0,k=0,N=0,x=0,P,J;
if(o[0]==3&&o[1]==0)return j?j:new I(0);var A=j==null;if(A)j=new I(o.length>>>2<<3);while(r==0){r=s(o,x,1);
i=s(o,x+1,2);x+=3;if(i==0){if((x&7)!=0)x+=8-(x&7);var K=(x>>>3)+4,m=o[K-4]|o[K-3]<<8;if(A)j=H(j,N+m);
j.set(new I(o.buffer,o.byteOffset+K,m),N);x=K+m<<3;N+=m;continue}if(A)j=H(j,N+(1<<17));if(i==1){P=D.g;
J=D.A;a=(1<<9)-1;k=(1<<5)-1}if(i==2){y=F(o,x,5)+257;G=F(o,x+5,5)+1;f=F(o,x+10,4)+4;x+=14;var O=x,Q=1;
for(var p=0;p<38;p+=2){D.b[p]=0;D.b[p+1]=0}for(var p=0;p<f;p++){var l=F(o,x+p*3,3);D.b[(D.d[p]<<1)+1]=l;
if(l>Q)Q=l}x+=3*f;C(D.b,Q);t(D.b,Q,D.C);P=D.k;J=D.n;x=B(D.C,(1<<Q)-1,y+G,o,x,D.a);var u=d(D.a,0,y,D.c);
a=(1<<u)-1;var n=d(D.a,y,G,D.e);k=(1<<n)-1;C(D.c,u);t(D.c,u,P);C(D.e,n);t(D.e,n,J)}while(!0){var h=P[w(o,x)&a];
x+=h&15;var L=h>>>4;if(L>>>8==0){j[N++]=L}else if(L==256){break}else{var M=N+L-254;if(L>264){var z=D.B[L-257];
M=N+(z>>>3)+F(o,x,z&7);x+=z&7}var e=J[w(o,x)&k];x+=e&15;var E=e>>>4,c=D.h[E],q=(c>>>4)+s(o,x,c&15);x+=c&15;
if(A)j=H(j,N+(1<<17));while(N<M){j[N]=j[N++-q];j[N]=j[N++-q];j[N]=j[N++-q];j[N]=j[N++-q]}N=M}}}return j.length==N?j:j.slice(0,N)}function H(o,j){var I=o.length;
if(j<=I)return o;var A=new Uint8Array(Math.max(I<<1,j));A.set(o,0);return A}function B(o,j,I,A,r,i){var y=0;
while(y<I){var G=o[w(A,r)&j];r+=G&15;var f=G>>>4;if(f<=15){i[y]=f;y++}else{var a=0,k=0;if(f==16){k=3+F(A,r,2);
r+=2;a=i[y-1]}else if(f==17){k=3+F(A,r,3);r+=3}else if(f==18){k=11+F(A,r,7);r+=7}var N=y+k;while(y<N){i[y]=a;
y++}}}return r}function d(o,j,I,A){var r=0,i=0,y=A.length>>>1;while(i<I){var G=o[i+j];A[i<<1]=0;A[(i<<1)+1]=G;
if(G>r)r=G;i++}while(i<y){A[i<<1]=0;A[(i<<1)+1]=0;i++}return r}return v}();


	function _readInterlace(data, out)
	{
		var w = out.width, h = out.height;
		var bpp = _getBPP(out), cbpp = bpp>>3, bpl = Math.ceil(w*bpp/8);
		var img = new Uint8Array( h * bpl );
		var di = 0;

		var starting_row  = [ 0, 0, 4, 0, 2, 0, 1 ];
		var starting_col  = [ 0, 4, 0, 2, 0, 1, 0 ];
		var row_increment = [ 8, 8, 8, 4, 4, 2, 2 ];
		var col_increment = [ 8, 8, 4, 4, 2, 2, 1 ];

		var pass=0;
		while(pass<7)
		{
			var ri = row_increment[pass], ci = col_increment[pass];
			var sw = 0, sh = 0;
			var cr = starting_row[pass];  while(cr<h) {  cr+=ri;  sh++;  }
			var cc = starting_col[pass];  while(cc<w) {  cc+=ci;  sw++;  }
			var bpll = Math.ceil(sw*bpp/8);
			_filterZero(data, out, di, sw, sh);

			var y=0, row = starting_row[pass];
			while(row<h)
			{
				var col = starting_col[pass];
				var cdi = (di+y*bpll)<<3;

				while(col<w)
				{
					if(bpp==1) {
						var val = data[cdi>>3];  val = (val>>(7-(cdi&7)))&1;
						img[row*bpl + (col>>3)] |= (val << (7-((col&7)<<0)));
					}
					if(bpp==2) {
						var val = data[cdi>>3];  val = (val>>(6-(cdi&7)))&3;
						img[row*bpl + (col>>2)] |= (val << (6-((col&3)<<1)));
					}
					if(bpp==4) {
						var val = data[cdi>>3];  val = (val>>(4-(cdi&7)))&15;
						img[row*bpl + (col>>1)] |= (val << (4-((col&1)<<2)));
					}
					if(bpp>=8) {
						var ii = row*bpl+col*cbpp;
						for(var j=0; j<cbpp; j++) img[ii+j] = data[(cdi>>3)+j];
					}
					cdi+=bpp;  col+=ci;
				}
				y++;  row += ri;
			}
			if(sw*sh!=0) di += sh * (1 + bpll);
			pass = pass + 1;
		}
		return img;
	}

	function _getBPP(out) {
		var noc = [1,null,3,1,2,null,4][out.ctype];
		return noc * out.depth;
	}

	function _filterZero(data, out, off, w, h)
	{
		var bpp = _getBPP(out), bpl = Math.ceil(w*bpp/8);
		bpp = Math.ceil(bpp/8);
		
		var i,di, type=data[off], x=0;
		
		if(type>1) data[off]=[0,0,1][type-2];  
		if(type==3) for(x=bpp; x<bpl; x++) data[x+1] = (data[x+1] + (data[x+1-bpp]>>>1) )&255;

		for(var y=0; y<h; y++)  {
			i = off+y*bpl; di = i+y+1;
			type = data[di-1]; x=0;

			if     (type==0)   for(; x<bpl; x++) data[i+x] = data[di+x];
			else if(type==1) { for(; x<bpp; x++) data[i+x] = data[di+x];
							   for(; x<bpl; x++) data[i+x] = (data[di+x] + data[i+x-bpp]);  }
			else if(type==2) { for(; x<bpl; x++) data[i+x] = (data[di+x] + data[i+x-bpl]);  }
			else if(type==3) { for(; x<bpp; x++) data[i+x] = (data[di+x] + ( data[i+x-bpl]>>>1));
							   for(; x<bpl; x++) data[i+x] = (data[di+x] + ((data[i+x-bpl]+data[i+x-bpp])>>>1) );  }
			else             { for(; x<bpp; x++) data[i+x] = (data[di+x] + _paeth(0, data[i+x-bpl], 0));
							   for(; x<bpl; x++) data[i+x] = (data[di+x] + _paeth(data[i+x-bpp], data[i+x-bpl], data[i+x-bpp-bpl]) );  }
		}
		return data;
	}

	function _paeth(a,b,c)
	{
		var p = a+b-c, pa = (p-a), pb = (p-b), pc = (p-c);
		if (pa*pa <= pb*pb && pa*pa <= pc*pc)  return a;
		else if (pb*pb <= pc*pc)  return b;
		return c;
	}

	function _IHDR(data, offset, out)
	{
		out.width  = _bin.readUint(data, offset);  offset += 4;
		out.height = _bin.readUint(data, offset);  offset += 4;
		out.depth     = data[offset];  offset++;
		out.ctype     = data[offset];  offset++;
		out.compress  = data[offset];  offset++;
		out.filter    = data[offset];  offset++;
		out.interlace = data[offset];  offset++;
	}

	function _copyTile(sb, sw, sh, tb, tw, th, xoff, yoff, mode)
	{
		var w = Math.min(sw,tw), h = Math.min(sh,th);
		var si=0, ti=0;
		for(var y=0; y<h; y++)
			for(var x=0; x<w; x++)
			{
				if(xoff>=0 && yoff>=0) {  si = (y*sw+x)<<2;  ti = (( yoff+y)*tw+xoff+x)<<2;  }
				else                   {  si = ((-yoff+y)*sw-xoff+x)<<2;  ti = (y*tw+x)<<2;  }
				
				if     (mode==0) {  tb[ti] = sb[si];  tb[ti+1] = sb[si+1];  tb[ti+2] = sb[si+2];  tb[ti+3] = sb[si+3];  }
				else if(mode==1) {
					var fa = sb[si+3]*(1/255), fr=sb[si]*fa, fg=sb[si+1]*fa, fb=sb[si+2]*fa; 
					var ba = tb[ti+3]*(1/255), br=tb[ti]*ba, bg=tb[ti+1]*ba, bb=tb[ti+2]*ba; 
					
					var ifa=1-fa, oa = fa+ba*ifa, ioa = (oa==0?0:1/oa);
					tb[ti+3] = 255*oa;  
					tb[ti+0] = (fr+br*ifa)*ioa;  
					tb[ti+1] = (fg+bg*ifa)*ioa;   
					tb[ti+2] = (fb+bb*ifa)*ioa;  
				}
				else if(mode==2){	// copy only differences, otherwise zero
					var fa = sb[si+3], fr=sb[si], fg=sb[si+1], fb=sb[si+2]; 
					var ba = tb[ti+3], br=tb[ti], bg=tb[ti+1], bb=tb[ti+2]; 
					if(fa==ba && fr==br && fg==bg && fb==bb) {  tb[ti]=0;  tb[ti+1]=0;  tb[ti+2]=0;  tb[ti+3]=0;  }
					else {  tb[ti]=fr;  tb[ti+1]=fg;  tb[ti+2]=fb;  tb[ti+3]=fa;  }
				}
				else if(mode==3){	// check if can be blended
					var fa = sb[si+3], fr=sb[si], fg=sb[si+1], fb=sb[si+2]; 
					var ba = tb[ti+3], br=tb[ti], bg=tb[ti+1], bb=tb[ti+2]; 
					if(fa==ba && fr==br && fg==bg && fb==bb) continue;
					//if(fa!=255 && ba!=0) return false;
					if(fa<220 && ba>20) return false;
				}
			}
		return true;
	}
	
	return {
		decode:decode,
		toRGBA8:toRGBA8,
		_paeth:_paeth,
		_copyTile:_copyTile,
		_bin:_bin
	};

})();


(function() {
	var _copyTile = UPNG._copyTile, _bin=UPNG._bin, paeth = UPNG._paeth;
	var crcLib = {
		table : ( function() {
		   var tab = new Uint32Array(256);
		   for (var n=0; n<256; n++) {
				var c = n;
				for (var k=0; k<8; k++) {
					if (c & 1)  c = 0xedb88320 ^ (c >>> 1);
					else        c = c >>> 1;
				}
				tab[n] = c;  }
			return tab;  })(),
		update : function(c, buf, off, len) {
			for (var i=0; i<len; i++)  c = crcLib.table[(c ^ buf[off+i]) & 0xff] ^ (c >>> 8);
			return c;
		},
		crc : function(b,o,l)  {  return crcLib.update(0xffffffff,b,o,l) ^ 0xffffffff;  }
	}
	
	
	function addErr(er, tg, ti, f) {
		tg[ti]+=(er[0]*f)>>4;  tg[ti+1]+=(er[1]*f)>>4;  tg[ti+2]+=(er[2]*f)>>4;  tg[ti+3]+=(er[3]*f)>>4;  
	}
	function N(x) {  return Math.max(0, Math.min(255, x));  }
	function D(a,b) {  var dr=a[0]-b[0], dg=a[1]-b[1], db=a[2]-b[2], da=a[3]-b[3];  return (dr*dr + dg*dg + db*db + da*da);  }
		
	// MTD: 0: None, 1: floyd-steinberg, 2: Bayer
	function dither(sb, w, h, plte, tb, oind, MTD) {
		if(MTD==null) MTD=1;		
		
		var pc=plte.length, nplt = [], rads=[];
		for(var i=0; i<pc; i++) {
			var c = plte[i];
			nplt.push([((c>>>0)&255), ((c>>>8)&255), ((c>>>16)&255), ((c>>>24)&255)]);
		}
		for(var i=0; i<pc; i++) {
			var ne=0xffffffff, ni=0;
			for(var j=0; j<pc; j++) {  var ce=D(nplt[i],nplt[j]);  if(j!=i && ce<ne) {  ne=ce;  ni=j;  }  }
			var hd = Math.sqrt(ne)/2;
			rads[i] = ~~(hd*hd);
		}
			
		var tb32 = new Uint32Array(tb.buffer);
		var err = new Int16Array(w*h*4);
		
		/*
		var S=2, M = [
			0,2,
		    3,1];  //*/
		//*
		var S=4, M = [
			 0, 8, 2,10,
		    12, 4,14, 6,
			 3,11, 1, 9,
			15, 7,13, 5 ];  //*/
		for(var i=0; i<M.length; i++) M[i] = 255*(-0.5 + (M[i]+0.5)/(S*S));
		
		for(var y=0; y<h; y++) {
			for(var x=0; x<w; x++) {
				var i = (y*w+x)*4;
				
				var cc;
				if(MTD!=2) cc = [N(sb[i]+err[i]), N(sb[i+1]+err[i+1]), N(sb[i+2]+err[i+2]), N(sb[i+3]+err[i+3])];
				else {
					var ce = M[(y&(S-1))*S+(x&(S-1))];
					cc = [N(sb[i]+ce), N(sb[i+1]+ce), N(sb[i+2]+ce), N(sb[i+3]+ce)];
				}
				
				var ni=0, nd = 0xffffff;
				for(var j=0; j<pc; j++) {
					var cd = D(cc,nplt[j]);
					if(cd<nd) {  nd=cd;  ni=j;  }
				}  
				
				var nc = nplt[ni];
				var er = [cc[0]-nc[0], cc[1]-nc[1], cc[2]-nc[2], cc[3]-nc[3]];
				
				if(MTD==1) {
					//addErr(er, err, i+4, 16);
					if(x!=w-1) addErr(er, err, i+4    , 7);
					if(y!=h-1) {
						if(x!=  0) addErr(er, err, i+4*w-4, 3);
								   addErr(er, err, i+4*w  , 5);
						if(x!=w-1) addErr(er, err, i+4*w+4, 1);  
					}//*/
				}
				oind[i>>2] = ni;  tb32[i>>2] = plte[ni];
			}
		}
	}

	
	function encode(bufs, w, h, ps, dels, tabs, forbidPlte)
	{
		if(ps==null) ps=0;
		if(forbidPlte==null) forbidPlte = false;

		var nimg = compress(bufs, w, h, ps, [false, false, false, 0, forbidPlte,false]);
		compressPNG(nimg, -1);
		
		return _main(nimg, w, h, dels, tabs);
	}

	function encodeLL(bufs, w, h, cc, ac, depth, dels, tabs) {
		var nimg = {  ctype: 0 + (cc==1 ? 0 : 2) + (ac==0 ? 0 : 4),      depth: depth,  frames: []  };
		
		var bipp = (cc+ac)*depth, bipl = bipp * w;
		for(var i=0; i<bufs.length; i++)
			nimg.frames.push({  rect:{x:0,y:0,width:w,height:h},  img:new Uint8Array(bufs[i]), blend:0, dispose:1, bpp:Math.ceil(bipp/8), bpl:Math.ceil(bipl/8)  });
		
		compressPNG(nimg, 0, true);
		
		var out = _main(nimg, w, h, dels, tabs);
		return out;
	}

	function _main(nimg, w, h, dels, tabs) {
		if(tabs==null) tabs={};
		var crc = crcLib.crc, wUi = _bin.writeUint, wUs = _bin.writeUshort, wAs = _bin.writeASCII;
		var offset = 8, anim = nimg.frames.length>1, pltAlpha = false;
		
		var cicc;
		
		var leng = 8 + (16+5+4) /*+ (9+4)*/ + (anim ? 20 : 0);
		if(tabs["sRGB"]!=null) leng += 8+1+4;
		if(tabs["pHYs"]!=null) leng += 8+9+4;
		if(tabs["iCCP"]!=null) {  cicc = pako.deflate(tabs["iCCP"]);  leng += 8 + 11 + 2 + cicc.length + 4;  }
		if(nimg.ctype==3) {
			var dl = nimg.plte.length;
			for(var i=0; i<dl; i++) if((nimg.plte[i]>>>24)!=255) pltAlpha = true;
			leng += (8 + dl*3 + 4) + (pltAlpha ? (8 + dl*1 + 4) : 0);
		}
		for(var j=0; j<nimg.frames.length; j++)
		{
			var fr = nimg.frames[j];
			if(anim) leng += 38;
			leng += fr.cimg.length + 12;
			if(j!=0) leng+=4;
		}
		leng += 12; 
		
		var data = new Uint8Array(leng);
		var wr=[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
		for(var i=0; i<8; i++) data[i]=wr[i];
		
		wUi(data,offset, 13);     offset+=4;
		wAs(data,offset,"IHDR");  offset+=4;
		wUi(data,offset,w);  offset+=4;
		wUi(data,offset,h);  offset+=4;
		data[offset] = nimg.depth;  offset++;  // depth
		data[offset] = nimg.ctype;  offset++;  // ctype
		data[offset] = 0;  offset++;  // compress
		data[offset] = 0;  offset++;  // filter
		data[offset] = 0;  offset++;  // interlace
		wUi(data,offset,crc(data,offset-17,17));  offset+=4; // crc

		// 13 bytes to say, that it is sRGB
		if(tabs["sRGB"]!=null) {
			wUi(data,offset, 1);      offset+=4;
			wAs(data,offset,"sRGB");  offset+=4;
			data[offset] = tabs["sRGB"];  offset++;
			wUi(data,offset,crc(data,offset-5,5));  offset+=4; // crc
		}
		if(tabs["iCCP"]!=null) {
			var sl = 11+2+cicc.length;
			wUi(data,offset, sl);  offset+=4;
			wAs(data,offset,"iCCP");  offset+=4;
			wAs(data,offset,"ICC profile");  offset+=11;  offset+=2;
			data.set(cicc, offset);  offset+=cicc.length;
			wUi(data,offset,crc(data,offset-(sl+4),sl+4));  offset+=4; // crc
		}
		if(tabs["pHYs"]!=null) {
			wUi(data,offset, 9);      offset+=4;
			wAs(data,offset,"pHYs");  offset+=4;
			wUi(data,offset, tabs["pHYs"][0]);      offset+=4;
			wUi(data,offset, tabs["pHYs"][1]);      offset+=4;
			data[offset]=tabs["pHYs"][2];			offset++;
			wUi(data,offset,crc(data,offset-13,13));  offset+=4; // crc
		}

		if(anim) {
			wUi(data,offset, 8);      offset+=4;
			wAs(data,offset,"acTL");  offset+=4;
			wUi(data,offset, nimg.frames.length);     offset+=4;
			wUi(data,offset, tabs["loop"]!=null?tabs["loop"]:0);      offset+=4;
			wUi(data,offset,crc(data,offset-12,12));  offset+=4; // crc
		}

		if(nimg.ctype==3) {
			var dl = nimg.plte.length;
			wUi(data,offset, dl*3);  offset+=4;
			wAs(data,offset,"PLTE");  offset+=4;
			for(var i=0; i<dl; i++){
				var ti=i*3, c=nimg.plte[i], r=(c)&255, g=(c>>>8)&255, b=(c>>>16)&255;
				data[offset+ti+0]=r;  data[offset+ti+1]=g;  data[offset+ti+2]=b;
			}
			offset+=dl*3;
			wUi(data,offset,crc(data,offset-dl*3-4,dl*3+4));  offset+=4; // crc

			if(pltAlpha) {
				wUi(data,offset, dl);  offset+=4;
				wAs(data,offset,"tRNS");  offset+=4;
				for(var i=0; i<dl; i++)  data[offset+i]=(nimg.plte[i]>>>24)&255;
				offset+=dl;
				wUi(data,offset,crc(data,offset-dl-4,dl+4));  offset+=4; // crc
			}
		}
		
		var fi = 0;
		for(var j=0; j<nimg.frames.length; j++)
		{
			var fr = nimg.frames[j];
			if(anim) {
				wUi(data, offset, 26);     offset+=4;
				wAs(data, offset,"fcTL");  offset+=4;
				wUi(data, offset, fi++);   offset+=4;
				wUi(data, offset, fr.rect.width );   offset+=4;
				wUi(data, offset, fr.rect.height);   offset+=4;
				wUi(data, offset, fr.rect.x);   offset+=4;
				wUi(data, offset, fr.rect.y);   offset+=4;
				wUs(data, offset, dels[j]);   offset+=2;
				wUs(data, offset,  1000);   offset+=2;
				data[offset] = fr.dispose;  offset++;	// dispose
				data[offset] = fr.blend  ;  offset++;	// blend
				wUi(data,offset,crc(data,offset-30,30));  offset+=4; // crc
			}
					
			var imgd = fr.cimg, dl = imgd.length;
			wUi(data,offset, dl+(j==0?0:4));     offset+=4;
			var ioff = offset;
			wAs(data,offset,(j==0)?"IDAT":"fdAT");  offset+=4;
			if(j!=0) {  wUi(data, offset, fi++);  offset+=4;  }
			data.set(imgd,offset);
			offset += dl;
			wUi(data,offset,crc(data,ioff,offset-ioff));  offset+=4; // crc
		}

		wUi(data,offset, 0);     offset+=4;
		wAs(data,offset,"IEND");  offset+=4;
		wUi(data,offset,crc(data,offset-4,4));  offset+=4; // crc

		return data.buffer;
	}

	function compressPNG(out, filter, levelZero) {
		for(var i=0; i<out.frames.length; i++) {
			var frm = out.frames[i], nw=frm.rect.width, nh=frm.rect.height;
			var fdata = new Uint8Array(nh*frm.bpl+nh);
			frm.cimg = _filterZero(frm.img,nh,frm.bpp,frm.bpl,fdata, filter, levelZero);
		}
	}



	function compress(bufs, w, h, ps, prms) // prms:  onlyBlend, minBits, forbidPlte
	{
		var onlyBlend = prms[0], evenCrd = prms[1], forbidPrev = prms[2], minBits = prms[3], forbidPlte = prms[4], dith=prms[5];
		
		var ctype = 6, depth = 8, alphaAnd=255
		
		for(var j=0; j<bufs.length; j++)  {  // when not quantized, other frames can contain colors, that are not in an initial frame
			var img = new Uint8Array(bufs[j]), ilen = img.length;
			for(var i=0; i<ilen; i+=4) alphaAnd &= img[i+3];
		}
		var gotAlpha = (alphaAnd!=255);
		
		//var brute = gotAlpha && forGIF;		// brute : frames can only be copied, not "blended"
		var frms = framize(bufs, w, h, onlyBlend, evenCrd, forbidPrev);
		
		var cmap={}, plte=[], inds=[]; 
		
		if(ps!=0) {
			var nbufs = [];  for(var i=0; i<frms.length; i++) nbufs.push(frms[i].img.buffer);
			
			var abuf = concatRGBA(nbufs), qres = quantize(abuf, ps);
			
			for(var i=0; i<qres.plte.length; i++) plte.push(qres.plte[i].est.rgba);
			
			var cof = 0;
			for(var i=0; i<frms.length; i++) {  
				var frm=frms[i], bln=frm.img.length, ind = new Uint8Array(qres.inds.buffer, cof>>2, bln>>2);  inds.push(ind);
				var bb = new Uint8Array(qres.abuf,cof,bln);
				
				if(dith) dither(frm.img, frm.rect.width, frm.rect.height, plte, bb, ind);
				frm.img.set(bb);  cof+=bln;  
			}
			
		}
		else {
			// what if ps==0, but there are <=256 colors?  we still need to detect, if the palette could be used
			for(var j=0; j<frms.length; j++)  {  // when not quantized, other frames can contain colors, that are not in an initial frame
				var frm = frms[j], img32 = new Uint32Array(frm.img.buffer), nw=frm.rect.width, ilen = img32.length;
				var ind = new Uint8Array(ilen);  inds.push(ind);
				for(var i=0; i<ilen; i++) {
					var c = img32[i];
					if     (i!=0 && c==img32[i- 1]) ind[i]=ind[i-1];
					else if(i>nw && c==img32[i-nw]) ind[i]=ind[i-nw];
					else {
						var cmc = cmap[c];
						if(cmc==null) {  cmap[c]=cmc=plte.length;  plte.push(c);  if(plte.length>=300) break;  }
						ind[i]=cmc;
					}
				}
			}
		}
		
		var cc=plte.length; //console.log("colors:",cc);
		if(cc<=256 && forbidPlte==false) {
			if(cc<= 2) depth=1;  else if(cc<= 4) depth=2;  else if(cc<=16) depth=4;  else depth=8;
			depth =  Math.max(depth, minBits);
		}
		
		for(var j=0; j<frms.length; j++)
		{
			var frm = frms[j], nx=frm.rect.x, ny=frm.rect.y, nw=frm.rect.width, nh=frm.rect.height;
			var cimg = frm.img, cimg32 = new Uint32Array(cimg.buffer);
			var bpl = 4*nw, bpp=4;
			if(cc<=256 && forbidPlte==false) {
				bpl = Math.ceil(depth*nw/8);
				var nimg = new Uint8Array(bpl*nh);
				var inj = inds[j];
				for(var y=0; y<nh; y++) {  var i=y*bpl, ii=y*nw;
					if     (depth==8) for(var x=0; x<nw; x++) nimg[i+(x)   ]   =  (inj[ii+x]             );
					else if(depth==4) for(var x=0; x<nw; x++) nimg[i+(x>>1)]  |=  (inj[ii+x]<<(4-(x&1)*4));
					else if(depth==2) for(var x=0; x<nw; x++) nimg[i+(x>>2)]  |=  (inj[ii+x]<<(6-(x&3)*2));
					else if(depth==1) for(var x=0; x<nw; x++) nimg[i+(x>>3)]  |=  (inj[ii+x]<<(7-(x&7)*1));
				}
				cimg=nimg;  ctype=3;  bpp=1;
			}
			else if(gotAlpha==false && frms.length==1) {	// some next "reduced" frames may contain alpha for blending
				var nimg = new Uint8Array(nw*nh*3), area=nw*nh;
				for(var i=0; i<area; i++) { var ti=i*3, qi=i*4;  nimg[ti]=cimg[qi];  nimg[ti+1]=cimg[qi+1];  nimg[ti+2]=cimg[qi+2];  }
				cimg=nimg;  ctype=2;  bpp=3;  bpl=3*nw;
			}
			frm.img=cimg;  frm.bpl=bpl;  frm.bpp=bpp;
		}
		
		return {ctype:ctype, depth:depth, plte:plte, frames:frms  };
	}
	function framize(bufs,w,h,alwaysBlend,evenCrd,forbidPrev) {
		/*  DISPOSE
			- 0 : no change
			- 1 : clear to transparent
			- 2 : retstore to content before rendering (previous frame disposed)
			BLEND
			- 0 : replace
			- 1 : blend
		*/
		var frms = [];
		for(var j=0; j<bufs.length; j++) {
			var cimg = new Uint8Array(bufs[j]), cimg32 = new Uint32Array(cimg.buffer);
			var nimg;
			
			var nx=0, ny=0, nw=w, nh=h, blend=alwaysBlend?1:0;
			if(j!=0) {
				var tlim = (forbidPrev || alwaysBlend || j==1 || frms[j-2].dispose!=0)?1:2, tstp = 0, tarea = 1e9;
				for(var it=0; it<tlim; it++)
				{
					var pimg = new Uint8Array(bufs[j-1-it]), p32 = new Uint32Array(bufs[j-1-it]);
					var mix=w,miy=h,max=-1,may=-1;
					for(var y=0; y<h; y++) for(var x=0; x<w; x++) {
						var i = y*w+x;
						if(cimg32[i]!=p32[i]) {
							if(x<mix) mix=x;  if(x>max) max=x;
							if(y<miy) miy=y;  if(y>may) may=y;
						}
					}
					if(max==-1) mix=miy=max=may=0;
					if(evenCrd) {  if((mix&1)==1)mix--;  if((miy&1)==1)miy--;  }
					var sarea = (max-mix+1)*(may-miy+1);
					if(sarea<tarea) {
						tarea = sarea;  tstp = it;
						nx = mix; ny = miy; nw = max-mix+1; nh = may-miy+1;
					}
				}
				
				// alwaysBlend: pokud zjistím, že blendit nelze, nastavím předchozímu snímku dispose=1. Zajistím, aby obsahoval můj obdélník.
				var pimg = new Uint8Array(bufs[j-1-tstp]);
				if(tstp==1) frms[j-1].dispose = 2;
				
				nimg = new Uint8Array(nw*nh*4);
				_copyTile(pimg,w,h, nimg,nw,nh, -nx,-ny, 0);
				
				blend =  _copyTile(cimg,w,h, nimg,nw,nh, -nx,-ny, 3) ? 1 : 0;
				if(blend==1) _prepareDiff(cimg,w,h,nimg,{x:nx,y:ny,width:nw,height:nh});
				else         _copyTile(cimg,w,h, nimg,nw,nh, -nx,-ny, 0);
			}
			else nimg = cimg.slice(0);	// img may be rewritten further ... don't rewrite input
			
			frms.push({rect:{x:nx,y:ny,width:nw,height:nh}, img:nimg, blend:blend, dispose:0});
		}
		
		
		if(alwaysBlend) for(var j=0; j<frms.length; j++) {
			var frm = frms[j];  if(frm.blend==1) continue;
			var r0 = frm.rect, r1 = frms[j-1].rect
			var miX = Math.min(r0.x, r1.x), miY = Math.min(r0.y, r1.y);
			var maX = Math.max(r0.x+r0.width, r1.x+r1.width), maY = Math.max(r0.y+r0.height, r1.y+r1.height);
			var r = {x:miX, y:miY, width:maX-miX, height:maY-miY};
			
			frms[j-1].dispose = 1;
			if(j-1!=0) 
			_updateFrame(bufs, w,h,frms, j-1,r, evenCrd);
			_updateFrame(bufs, w,h,frms, j  ,r, evenCrd);
		}
		var area = 0;
		if(bufs.length!=1) for(var i=0; i<frms.length; i++) {
			var frm = frms[i];
			area += frm.rect.width*frm.rect.height;
			//if(i==0 || frm.blend!=1) continue;
			//var ob = new Uint8Array(
		}
		//if(area!=0) console.log(area);
		return frms;
	}
	function _updateFrame(bufs, w,h, frms, i, r, evenCrd) {
		var U8 = Uint8Array, U32 = Uint32Array;
		var pimg = new U8(bufs[i-1]), pimg32 = new U32(bufs[i-1]), nimg = i+1<bufs.length ? new U8(bufs[i+1]):null;
		var cimg = new U8(bufs[i]), cimg32 = new U32(cimg.buffer);
		
		var mix=w,miy=h,max=-1,may=-1;
		for(var y=0; y<r.height; y++) for(var x=0; x<r.width; x++) {
			var cx = r.x+x, cy = r.y+y;
			var j = cy*w+cx, cc = cimg32[j];
			// no need to draw transparency, or to dispose it. Or, if writing the same color and the next one does not need transparency.
			if(cc==0 || (frms[i-1].dispose==0 && pimg32[j]==cc && (nimg==null || nimg[j*4+3]!=0))/**/) {}
			else {
				if(cx<mix) mix=cx;  if(cx>max) max=cx;
				if(cy<miy) miy=cy;  if(cy>may) may=cy;
			}
		}
		if(max==-1) mix=miy=max=may=0;
		if(evenCrd) {  if((mix&1)==1)mix--;  if((miy&1)==1)miy--;  }
		r = {x:mix, y:miy, width:max-mix+1, height:may-miy+1};
		
		var fr = frms[i];  fr.rect = r;  fr.blend = 1;  fr.img = new Uint8Array(r.width*r.height*4);
		if(frms[i-1].dispose==0) {
			_copyTile(pimg,w,h, fr.img,r.width,r.height, -r.x,-r.y, 0);
			_prepareDiff(cimg,w,h,fr.img,r);
		}
		else
			_copyTile(cimg,w,h, fr.img,r.width,r.height, -r.x,-r.y, 0);
	}
	function _prepareDiff(cimg, w,h, nimg, rec) {
		_copyTile(cimg,w,h, nimg,rec.width,rec.height, -rec.x,-rec.y, 2);
	}

	function _filterZero(img,h,bpp,bpl,data, filter, levelZero)
	{
		var fls = [], ftry=[0,1,2,3,4];
		if     (filter!=-1)             ftry=[filter];
		else if(h*bpl>500000 || bpp==1) ftry=[0];
		var opts;  if(levelZero) opts={level:0};
		
		
		var CMPR = (data.length>10e6 && window.UZIP!=null) ? window.UZIP : pako;
		
		var time = Date.now();
		for(var i=0; i<ftry.length; i++) {
			for(var y=0; y<h; y++) _filterLine(data, img, y, bpl, bpp, ftry[i]);
			//var nimg = new Uint8Array(data.length);
			//var sz = UZIP.F.deflate(data, nimg);  fls.push(nimg.slice(0,sz));
			//var dfl = pako["deflate"](data), dl=dfl.length-4;
			//var crc = (dfl[dl+3]<<24)|(dfl[dl+2]<<16)|(dfl[dl+1]<<8)|(dfl[dl+0]<<0);
			fls.push(CMPR["deflate"](data,opts));
		}
		
		var ti, tsize=1e9;
		for(var i=0; i<fls.length; i++) if(fls[i].length<tsize) {  ti=i;  tsize=fls[i].length;  }
		return fls[ti];
	}
	function _filterLine(data, img, y, bpl, bpp, type)
	{
		var i = y*bpl, di = i+y;
		data[di]=type;  di++;

		if(type==0) {
			if(bpl<500) for(var x=0; x<bpl; x++) data[di+x] = img[i+x];
			else data.set(new Uint8Array(img.buffer,i,bpl),di);
		}
		else if(type==1) {
			for(var x=  0; x<bpp; x++) data[di+x] =  img[i+x];
			for(var x=bpp; x<bpl; x++) data[di+x] = (img[i+x]-img[i+x-bpp]+256)&255;
		}
		else if(y==0) {
			for(var x=  0; x<bpp; x++) data[di+x] = img[i+x];

			if(type==2) for(var x=bpp; x<bpl; x++) data[di+x] = img[i+x];
			if(type==3) for(var x=bpp; x<bpl; x++) data[di+x] = (img[i+x] - (img[i+x-bpp]>>1) +256)&255;
			if(type==4) for(var x=bpp; x<bpl; x++) data[di+x] = (img[i+x] - paeth(img[i+x-bpp], 0, 0) +256)&255;
		}
		else {
			if(type==2) { for(var x=  0; x<bpl; x++) data[di+x] = (img[i+x]+256 - img[i+x-bpl])&255;  }
			if(type==3) { for(var x=  0; x<bpp; x++) data[di+x] = (img[i+x]+256 - (img[i+x-bpl]>>1))&255;
						  for(var x=bpp; x<bpl; x++) data[di+x] = (img[i+x]+256 - ((img[i+x-bpl]+img[i+x-bpp])>>1))&255;  }
			if(type==4) { for(var x=  0; x<bpp; x++) data[di+x] = (img[i+x]+256 - paeth(0, img[i+x-bpl], 0))&255;
						  for(var x=bpp; x<bpl; x++) data[di+x] = (img[i+x]+256 - paeth(img[i+x-bpp], img[i+x-bpl], img[i+x-bpp-bpl]))&255;  }
		}
	}


	function quantize(abuf, ps, doKmeans)
	{	
		var sb = new Uint8Array(abuf), tb = sb.slice(0), tb32 = new Uint32Array(tb.buffer);
		
		var KD = getKDtree(tb, ps);
		var root = KD[0], leafs = KD[1], K=leafs.length;
		
		var cl32 = new Uint32Array(K), clr8=new Uint8Array(cl32.buffer);
		for(var i=0; i<K; i++) cl32[i]=leafs[i].est.rgba;
		
		var len=sb.length;
			
		var inds = new Uint8Array(len>>2), nd;
		if(K<=60) {  findNearest(sb,inds,clr8);  remap(inds,tb32,cl32);  }
		else if(sb.length<32e6)  // precise, but slow :(
			//for(var j=0; j<4; j++) 
			for(var i=0; i<len; i+=4) {
				var r=sb[i]*(1/255), g=sb[i+1]*(1/255), b=sb[i+2]*(1/255), a=sb[i+3]*(1/255);
				
				nd = getNearest(root, r, g, b, a);
				inds[i>>2] = nd.ind;  tb32[i>>2] = nd.est.rgba;
			}
		else 
			for(var i=0; i<len; i+=4) {
				var r=sb[i]*(1/255), g=sb[i+1]*(1/255), b=sb[i+2]*(1/255), a=sb[i+3]*(1/255);
				
				nd = root;  while(nd.left) nd = (planeDst(nd.est,r,g,b,a)<=0) ? nd.left : nd.right;
				inds[i>>2] = nd.ind;  tb32[i>>2] = nd.est.rgba;
			}
			
		
		if(doKmeans || sb.length*K<10*4e6) {
			var le = 1e9;
			for(var i=0; i<10; i++) {
				var ce = kmeans(sb, inds, clr8);  //console.log(i,ce);
				if(ce/le>0.997) break;  le=ce;
			}
			for(var i=0; i<K; i++) leafs[i].est.rgba = cl32[i];
			remap(inds,tb32,cl32);
		}
		
		return {  abuf:tb.buffer, inds:inds, plte:leafs  };
	}
	
	function remap(inds,tb32,pl32) {  for(var i=0; i<inds.length; i++) tb32[i]=pl32[inds[i]];  }
	function kmeans(sb,inds,plte) {
		updatePalette(sb,inds,plte);
		var err = findNearest(sb,inds,plte);
		return err;
	}
	
	function updatePalette(sb,inds,plte) {
		var K = plte.length>>>2;
		var sums = new Uint32Array(K*4), cnts = new Uint32Array(K);
		
		for(var i=0; i<sb.length; i+=4) {
			var ind = inds[i>>>2], qi=ind*4;
			cnts[ind]++;
			sums[qi  ]+=sb[i  ];  sums[qi+1]+=sb[i+1];
			sums[qi+2]+=sb[i+2];  sums[qi+3]+=sb[i+3];
		}
		for(var i=0; i<plte.length; i++) plte[i]=Math.round(sums[i]/cnts[i>>>2]);
	}
	
	function findNearest(sb,inds,plte) {
		var terr = 0, K=plte.length>>>2;
		
		var nd = [];  // squared half-distance to the nearest color
		for(var i=0; i<K; i++) {
			var qi=i*4;
			var r=plte[qi], g=plte[qi+1], b=plte[qi+2], a=plte[qi+3], ti=0, te=1e9;
			for(var j=0; j<K; j++) {
				if(i==j) continue;
				var qj=j*4, dr=r-plte[qj], dg=g-plte[qj+1], db=b-plte[qj+2], da=a-plte[qj+3];
				var err = dr*dr+dg*dg+db*db+da*da;
				if(err<te) {te=err;  ti=j;}
			}
			nd[i] = Math.sqrt(te)*0.5;  nd[i]=nd[i]*nd[i];
		}
		
		for(var i=0; i<sb.length; i+=4) {
			var r=sb[i  ], g=sb[i+1], b=sb[i+2], a=sb[i+3];
			var ti=inds[i>>>2], qi=ti*4, dr=r-plte[qi], dg=g-plte[qi+1], db=b-plte[qi+2], da=a-plte[qi+3], te = dr*dr+dg*dg+db*db+da*da;
			if(te>nd[ti]) for(var j=0; j<K; j++) {
				qi=j*4; dr=r-plte[qi]; dg=g-plte[qi+1]; db=b-plte[qi+2]; da=a-plte[qi+3];
				var err = dr*dr+dg*dg+db*db+da*da;
				if(err<te) {te=err;  ti=j;  if(te<nd[j]) break; }
			}
			inds[i>>>2]=ti;
			terr+=te;
		}
		return terr/(sb.length>>>2);
	}

	function getKDtree(nimg, ps, err) {
		if(err==null) err = 0.0001;
		var nimg32 = new Uint32Array(nimg.buffer);
		
		var root = {i0:0, i1:nimg.length, bst:null, est:null, tdst:0, left:null, right:null };  // basic statistic, extra statistic
		root.bst = stats(  nimg,root.i0, root.i1  );  root.est = estats( root.bst );
		var leafs = [root];
		
		while(leafs.length<ps)
		{
			var maxL = 0, mi=0;
			for(var i=0; i<leafs.length; i++) if(leafs[i].est.L > maxL) {  maxL=leafs[i].est.L;  mi=i;  }
			if(maxL<err) break;
			var node = leafs[mi];
			
			var s0 = splitPixels(nimg,nimg32, node.i0, node.i1, node.est.e, node.est.eMq255);
			var s0wrong = (node.i0>=s0 || node.i1<=s0);
			//console.log(maxL, leafs.length, mi);
			if(s0wrong) {  node.est.L=0;  continue;  }
			
			
			var ln = {i0:node.i0, i1:s0, bst:null, est:null, tdst:0, left:null, right:null };  ln.bst = stats( nimg, ln.i0, ln.i1 );  
			ln.est = estats( ln.bst );
			var rn = {i0:s0, i1:node.i1, bst:null, est:null, tdst:0, left:null, right:null };  rn.bst = {R:[], m:[], N:node.bst.N-ln.bst.N};
			for(var i=0; i<16; i++) rn.bst.R[i] = node.bst.R[i]-ln.bst.R[i];
			for(var i=0; i< 4; i++) rn.bst.m[i] = node.bst.m[i]-ln.bst.m[i];
			rn.est = estats( rn.bst );
			
			node.left = ln;  node.right = rn;
			leafs[mi]=ln;  leafs.push(rn);
		}
		leafs.sort(function(a,b) {  return b.bst.N-a.bst.N;  });
		for(var i=0; i<leafs.length; i++) leafs[i].ind=i;
		return [root, leafs];
	}

	function getNearest(nd, r,g,b,a)
	{
		if(nd.left==null) {  nd.tdst = dist(nd.est.q,r,g,b,a);  return nd;  }
		var pd = planeDst(nd.est,r,g,b,a);
		
		var node0 = nd.left, node1 = nd.right;
		if(pd>0) {  node0=nd.right;  node1=nd.left;  }
		
		var ln = getNearest(node0, r,g,b,a);
		if(ln.tdst<=pd*pd) return ln;
		var rn = getNearest(node1, r,g,b,a);
		return rn.tdst<ln.tdst ? rn : ln;
	}
	function planeDst(est, r,g,b,a) {  var e = est.e;  return e[0]*r + e[1]*g + e[2]*b + e[3]*a - est.eMq;  }
	function dist    (q,   r,g,b,a) {  var d0=r-q[0], d1=g-q[1], d2=b-q[2], d3=a-q[3];  return d0*d0+d1*d1+d2*d2+d3*d3;  }

	function splitPixels(nimg, nimg32, i0, i1, e, eMq)
	{
		i1-=4;
		var shfs = 0;
		while(i0<i1)
		{
			while(vecDot(nimg, i0, e)<=eMq) i0+=4;
			while(vecDot(nimg, i1, e)> eMq) i1-=4;
			if(i0>=i1) break;
			
			var t = nimg32[i0>>2];  nimg32[i0>>2] = nimg32[i1>>2];  nimg32[i1>>2]=t;
			
			i0+=4;  i1-=4;
		}
		while(vecDot(nimg, i0, e)>eMq) i0-=4;
		return i0+4;
	}
	function vecDot(nimg, i, e)
	{
		return nimg[i]*e[0] + nimg[i+1]*e[1] + nimg[i+2]*e[2] + nimg[i+3]*e[3];
	}
	function stats(nimg, i0, i1){
		var R = [0,0,0,0,  0,0,0,0,  0,0,0,0,  0,0,0,0];
		var m = [0,0,0,0];
		var N = (i1-i0)>>2;
		for(var i=i0; i<i1; i+=4)
		{
			var r = nimg[i]*(1/255), g = nimg[i+1]*(1/255), b = nimg[i+2]*(1/255), a = nimg[i+3]*(1/255);
			//var r = nimg[i], g = nimg[i+1], b = nimg[i+2], a = nimg[i+3];
			m[0]+=r;  m[1]+=g;  m[2]+=b;  m[3]+=a;
			
			R[ 0] += r*r;  R[ 1] += r*g;  R[ 2] += r*b;  R[ 3] += r*a;  
						   R[ 5] += g*g;  R[ 6] += g*b;  R[ 7] += g*a; 
										  R[10] += b*b;  R[11] += b*a;  
														 R[15] += a*a;  
		}
		R[4]=R[1];  R[8]=R[2];  R[9]=R[6];  R[12]=R[3];  R[13]=R[7];  R[14]=R[11];
		
		return {R:R, m:m, N:N};
	}
	function estats(stats){
		var R = stats.R, m = stats.m, N = stats.N;
		
		// when all samples are equal, but N is large (millions), the Rj can be non-zero ( 0.0003.... - precission error)
		var m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], iN = (N==0 ? 0 : 1/N);
		var Rj = [
			R[ 0] - m0*m0*iN,  R[ 1] - m0*m1*iN,  R[ 2] - m0*m2*iN,  R[ 3] - m0*m3*iN,  
			R[ 4] - m1*m0*iN,  R[ 5] - m1*m1*iN,  R[ 6] - m1*m2*iN,  R[ 7] - m1*m3*iN,
			R[ 8] - m2*m0*iN,  R[ 9] - m2*m1*iN,  R[10] - m2*m2*iN,  R[11] - m2*m3*iN,  
			R[12] - m3*m0*iN,  R[13] - m3*m1*iN,  R[14] - m3*m2*iN,  R[15] - m3*m3*iN 
		];
		
		var A = Rj, M = M4;
		var b = [Math.random(),Math.random(),Math.random(),Math.random()], mi = 0, tmi = 0;
		
		if(N!=0)
		for(var i=0; i<16; i++) {
			b = M.multVec(A, b);  tmi = Math.sqrt(M.dot(b,b));  b = M.sml(1/tmi,  b);
			if(i!=0 && Math.abs(tmi-mi)<1e-9) break;  mi = tmi;
		}	
		//b = [0,0,1,0];  mi=N;
		var q = [m0*iN, m1*iN, m2*iN, m3*iN];
		var eMq255 = M.dot(M.sml(255,q),b);
		
		return {  Cov:Rj, q:q, e:b, L:mi,  eMq255:eMq255, eMq : M.dot(b,q),
					rgba: (((Math.round(255*q[3])<<24) | (Math.round(255*q[2])<<16) |  (Math.round(255*q[1])<<8) | (Math.round(255*q[0])<<0))>>>0)  };
	}
	var M4 = {
		multVec : function(m,v) {
				return [
					m[ 0]*v[0] + m[ 1]*v[1] + m[ 2]*v[2] + m[ 3]*v[3],
					m[ 4]*v[0] + m[ 5]*v[1] + m[ 6]*v[2] + m[ 7]*v[3],
					m[ 8]*v[0] + m[ 9]*v[1] + m[10]*v[2] + m[11]*v[3],
					m[12]*v[0] + m[13]*v[1] + m[14]*v[2] + m[15]*v[3]
				];
		},
		dot : function(x,y) {  return  x[0]*y[0]+x[1]*y[1]+x[2]*y[2]+x[3]*y[3];  },
		sml : function(a,y) {  return [a*y[0],a*y[1],a*y[2],a*y[3]];  }
	}

	function concatRGBA(bufs) {
		var tlen = 0;
		for(var i=0; i<bufs.length; i++) tlen += bufs[i].byteLength;
		var nimg = new Uint8Array(tlen), noff=0;
		for(var i=0; i<bufs.length; i++) {
			var img = new Uint8Array(bufs[i]), il = img.length;
			for(var j=0; j<il; j+=4) {  
				var r=img[j], g=img[j+1], b=img[j+2], a = img[j+3];
				if(a==0) r=g=b=0;
				nimg[noff+j]=r;  nimg[noff+j+1]=g;  nimg[noff+j+2]=b;  nimg[noff+j+3]=a;  }
			noff += il;
		}
		return nimg.buffer;
	}
	
	UPNG.encode = encode;
	UPNG.encodeLL = encodeLL;
	UPNG.encode.compress = compress;
	UPNG.encode.dither = dither;
	
	UPNG.quantize = quantize;
	UPNG.quantize.findNearest=findNearest;
	UPNG.quantize.getKDtree=getKDtree;
	UPNG.quantize.getNearest=getNearest;
})();

window.UPNG = UPNG