export const toHHMMSS = (secs) => {
    var sec_num = parseInt(secs, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor(sec_num / 60) % 60;
    var seconds = sec_num % 60;

    return [hours, minutes, seconds]
      .map((v) => (v < 10 ? '0' + v : v))
      .filter((v, i) => v !== '00' || i > 0)
      .join(':');
  };
// Helper function to build video filters
  export const buildVideoFilter = (effect, parameters) => {
  switch (effect) {

     case 'all':
      return `eq=brightness=${parameters.brightness}:contrast=${parameters.contrast}:saturation=${parameters.saturation}`;

    case 'brightness':
      return `eq=brightness=${parameters.brightness || 0}`;
    
    case 'contrast':
      return `eq=contrast=${parameters.contrast || 1}`;
    
    case 'saturation':
      return `eq=saturation=${parameters.saturation || 1}`;
    
    case 'hue':
      return `hue=h=${parameters.hue || 0}`;
    
    case 'blur':
      return `boxblur=${parameters.radius || 2}:${parameters.power || 1}`;
    
    case 'sharpen':
      return `unsharp=5:5:${parameters.strength || 1.0}:5:5:${parameters.strength || 1.0}`;
    
    case 'edge':
      return `edgedetect=low=${parameters.low || 0.1}:high=${parameters.high || 0.4}`;
    
    case 'emboss':
      return 'convolution=0 -1 0:-1 5 -1:0 -1 0:0:1:1:1:1:0:128:0';
    
    case 'negative':
      return 'negate';
    
    case 'sepia':
      return 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131';
    
    case 'grayscale':
      return 'colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3';
    
    case 'vintage':
      return `eq=contrast=1.2:brightness=0.1:saturation=0.8,colortemperature=${parameters.temperature || 4000}`;
    
    case 'noise':
      return `noise=alls=${parameters.strength || 20}:allf=t+u`;
    
    case 'vignette':
      return `vignette=PI/4:${parameters.intensity || 0.3}`;
    
    case 'chromakey':
      return `chromakey=${parameters.color || 'green'}:${parameters.similarity || 0.3}:${parameters.blend || 0.1}`;
    
    default:
      return 'eq=brightness=0'; // Default filter
  }
}

export const fileToBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result));
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
}; 