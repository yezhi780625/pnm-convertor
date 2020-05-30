# PNM Convertor
[![npm version](https://badge.fury.io/js/pnm-convertor.svg)](https://badge.fury.io/js/pnm-convertor)

Simple `promise` function to convert `.pbm`, `.pgm.` or `.ppm` file to image format (The default format type is `image/png`).

## Installation

```bash
 # with npm
npm install pnm-convertor
# with yarn
yarn add pnm-convertor
```

## Usage

```js
// React
import React, { memo, useState, useCallback } from 'react';
import convert from 'pnm-convertor';

const Demo = () => {
  const [image, setImage] = useState(null);
  const onChange = useCallback(async (e) => {
    const files = e.target.files;
    const file = await convert(files[0]);
    setImage(file);
  }, []);
  return (
    <div>
      <input type="file" onChange={onChange} />
      {image && <img src={image} alt="upload" />}
    </div>
  );
};

export default memo(Demo);
```

