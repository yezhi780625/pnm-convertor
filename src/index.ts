type PNMType = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
const BINARY_TYPES = ['P1', 'P4'];
const NET_PBM_EXT = ['pbm', 'pgm', 'ppm'];
interface NET_PBM_INTERFACE {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

function toBin(x: number) {
  const bin = x.toString(2);
  const pad = 8 - bin.length;
  const padZerosArr: string[] = [];
  padZerosArr[pad] = '';
  return padZerosArr.join('0') + bin;
}
function parseNetPBM(buffer: ArrayBuffer): NET_PBM_INTERFACE {
  const rawData = new Uint8Array(buffer);
  let nextByte,
    nextChar,
    byteOffset = 0,
    bitOffset = 0,
    inComment = false;
  const endChars = ' \n\r\t#';

  function getValue() {
    let ans = '';
    while (true) {
      nextByte = rawData[byteOffset];
      nextChar = String.fromCharCode(nextByte);
      ++byteOffset;
      if (nextByte === undefined) {
        return ans || undefined;
      }
      if (endChars.indexOf(nextChar) > -1) {
        if (nextChar === '#') {
          inComment = true;
        } else if (nextChar === '\n') {
          inComment = false;
        }
        if (ans.length) {
          return ans;
        }
      } else {
        if (!inComment) {
          ans += nextChar;
        }
      }
    }
  }

  function getByte() {
    return rawData[byteOffset++];
  }
  
  const getPixelData = (
    type: PNMType,
    width: number,
    height: number,
    colorRange: number | null,
  ) => {
    const data = new Uint8ClampedArray(width * height * 4);
    const total = width * height;
    let pixelValue;
    if (BINARY_TYPES.indexOf(type) !== -1) {
      switch (type) {
        case 'P1':
          for (let i = 0; i < total; i++) {
            pixelValue = 255 * Math.abs(parseInt(getValue() as string, 10) - 1);
            data[i * 4] = pixelValue;
            data[i * 4 + 1] = pixelValue;
            data[i * 4 + 2] = pixelValue;
            data[i * 4 + 3] = 255;
          }
          break;
        case 'P4':
          for (let i = 0; i < total; i+=8) {
            const byte = getByte();
            for(let j = 7; j >= 0 && (i + 7 - j) < total; j--) {
              pixelValue = Math.abs(((byte & (0b1 << j)) >> j) - 1) * 255;
              data[(i + 7 - j) * 4] = pixelValue;
              data[(i + 7 - j) * 4 + 1] = pixelValue;
              data[(i + 7 - j) * 4 + 2] = pixelValue;
              data[(i + 7 - j) * 4 + 3] = 255;
            }
          }
          break;
      }
    } else {
      const existsColorRange = colorRange as number;
      switch (type) {
        case 'P2':
          for (let i = 0; i < total; i++) {
            pixelValue = (255 * parseInt(getValue() as string, 10)) / existsColorRange;
            data[i * 4] = pixelValue;
            data[i * 4 + 1] = pixelValue;
            data[i * 4 + 2] = pixelValue;
            data[i * 4 + 3] = 255;
          }
          break;
        case 'P3':
          for (let i = 0; i < total; i++) {
            data[i * 4] = (255 * parseInt(getValue() as string, 10)) / existsColorRange;
            data[i * 4 + 1] = (255 * parseInt(getValue() as string, 10)) / existsColorRange;
            data[i * 4 + 2] = (255 * parseInt(getValue() as string, 10)) / existsColorRange;
            data[i * 4 + 3] = 255;
          }
          break;
        case 'P5':
          for (let i = 0; i < total; i++) {
            pixelValue = (255 * getByte()) / existsColorRange;
            data[i * 4] = pixelValue;
            data[i * 4 + 1] = pixelValue;
            data[i * 4 + 2] = pixelValue;
            data[i * 4 + 3] = 255;
          }
          break;
        case 'P6':
          for (let i = 0; i < total; i++) {
            data[i * 4] = (255 * getByte()) / existsColorRange;
            data[i * 4 + 1] = (255 * getByte()) / existsColorRange;
            data[i * 4 + 2] = (255 * getByte()) / existsColorRange;
            data[i * 4 + 3] = 255;
          }
          break;
        default:
      }
    }
    return data;
  };

  const type = getValue() as PNMType;
  const width = parseInt(getValue() as string, 10);
  const height = parseInt(getValue() as string, 10);
  const colorRange = BINARY_TYPES.indexOf(type) !== -1 ? null : parseInt(getValue() as string, 10);
  const data = getPixelData(type, width, height, colorRange);
  return {
    width,
    height,
    data,
  };
}
function NetPBMtoPng(pnm: NET_PBM_INTERFACE, type: string) {
  const { data, width, height } = pnm;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(data, width, height);
  if (ctx !== null) {
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL(type);
  }
}
function transferPNMtoPNG(file: File, type: string) {
  return new Promise((resolve, reject) => {
    const ext = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
    const reader = new FileReader();
    reader.onabort = () => reject(new Error('file reading was aborted'));
    reader.onerror = () => reject(new Error('file reading has failed'));

    if (NET_PBM_EXT.indexOf(ext) !== -1) {
      reader.onload = (e) => {
        if (e?.target?.result instanceof ArrayBuffer) {
          const buffer = e.target.result;
          const result = parseNetPBM(buffer);
        resolve(NetPBMtoPng(result, type));
        } else {
          reject(new Error('no file.'));
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('invalid '));
    }
  });
}

export default transferPNMtoPNG;
