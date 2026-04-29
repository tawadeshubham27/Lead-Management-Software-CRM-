import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'leads.json');

export async function getLeads() {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If file doesn't exist, return empty array
      return [];
    }
    throw error;
  }
}

export async function saveLeads(leads) {
  // Ensure the directory exists
  const dir = path.dirname(dataFilePath);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  
  await fs.writeFile(dataFilePath, JSON.stringify(leads, null, 2), 'utf8');
}
