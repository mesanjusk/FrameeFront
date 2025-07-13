import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import Papa from 'papaparse';

const Instify = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [csv, setCsv] = useState('');

  useEffect(() => {
    const c = new fabric.Canvas(canvasRef.current, { width: 800, height: 600 });
    setCanvas(c);

    fetch('/templates/sample.json')
      .then(res => res.json())
      .then(data => {
        c.loadFromJSON(data, c.renderAll.bind(c));
      })
      .catch(() => {});

    return () => c.dispose();
  }, []);

  const handleTemplateUpload = async (e) => {
    if (!canvas) return;
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const json = JSON.parse(text);
    canvas.loadFromJSON(json, canvas.renderAll.bind(canvas));
  };

  const mergeData = () => {
    if (!canvas || !csv) return;
    const parsed = Papa.parse(csv, { header: true }).data[0];
    if (!parsed) return;
    canvas.getObjects().forEach(obj => {
      if (obj.name && parsed[obj.name]) {
        obj.text = parsed[obj.name];
      }
    });
    canvas.renderAll();
  };

  const download = () => {
    if (!canvas) return;
    const url = canvas.toDataURL({ format: 'png' });
    const link = document.createElement('a');
    link.href = url;
    link.download = 'instify.png';
    link.click();
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Instify Image Generator</h1>

      <div className="flex flex-col gap-2 max-w-xl">
        <input type="file" accept="application/json" onChange={handleTemplateUpload} />
        <textarea
          className="border p-2 h-24"
          placeholder="Paste CSV data here (header: name,course)"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
        />
        <div className="flex gap-2">
          <button onClick={mergeData} className="bg-blue-600 text-white px-3 py-1 rounded">Merge Data</button>
          <button onClick={download} className="bg-green-600 text-white px-3 py-1 rounded">Download PNG</button>
        </div>
      </div>

      <canvas ref={canvasRef} className="border w-full mt-4" />
    </div>
  );
};

export default Instify;
