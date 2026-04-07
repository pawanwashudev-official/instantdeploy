import JSZip from 'jszip';

type VirtualFileSystem = Record<string, { content: string; isBinary: boolean }>;

export async function createZipBlob(files: VirtualFileSystem): Promise<Blob> {
  const zip = new JSZip();

  for (const [path, file] of Object.entries(files)) {
    if (file.isBinary) {
      zip.file(path, file.content, { base64: true });
    } else {
      zip.file(path, file.content);
    }
  }

  // FORCE HTML headers for Netlify
  if (files['index.html']) {
     zip.file("_headers", "/*\n  Content-Type: text/html; charset=utf-8\n");
  }

  return await zip.generateAsync({ type: "blob" });
}

export async function downloadZip(files: VirtualFileSystem, filename: string = 'project.zip') {
  const blob = await createZipBlob(files);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 2000);
}

export async function deployToNetlify(files: VirtualFileSystem, token: string): Promise<string> {
  if (!token) throw new Error("Netlify token is required");

  const zipBlob = await createZipBlob(files);

  // Create a unique random site name
  const siteName = `instant-deploy-${Math.random().toString(36).substring(2, 10)}`;
  const predictedUrl = `https://${siteName}.netlify.app`;

  // Create Site
  const createResponse = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: siteName })
  });

  if (!createResponse.ok) {
       throw new Error(`Failed to create Netlify site: ${createResponse.statusText}`);
  }

  const siteData = await createResponse.json();
  const siteId = siteData.id;

  // Deploy Zip to Site
  const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/zip'
      },
      body: zipBlob
  });

  if (!deployResponse.ok) {
      throw new Error(`Failed to upload to Netlify: ${deployResponse.statusText}`);
  }

  return predictedUrl;
}

export async function deployToVercel(files: VirtualFileSystem, token: string): Promise<string> {
  if (!token) throw new Error("Vercel token is required");

  const vercelFiles = Object.entries(files).map(([path, file]) => {
    return {
      file: path,
      data: file.content,
      encoding: file.isBinary ? 'base64' : 'utf-8'
    };
  });

  const projectName = `instant-deploy-${Math.random().toString(36).substring(2, 10)}`;

  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      files: vercelFiles,
      projectSettings: {
        framework: null // standard HTML/JS
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(`Failed to deploy to Vercel: ${response.statusText} ${errorData ? JSON.stringify(errorData) : ''}`);
  }

  const data = await response.json();
  return `https://${data.url}`;
}
