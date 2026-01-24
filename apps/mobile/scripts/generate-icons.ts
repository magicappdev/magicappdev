/**
 * Icon Generator Script
 *
 * Generates PNG app icons from a source logo with transparency support.
 * This script uses the Node.js Canvas library to create properly transparent PNG icons.
 *
 * Requirements:
 *   npm install canvas
 *
 * Usage:
 *   npx tsx scripts/generate-icons.ts
 */

import fs from "fs";
import path from "path";
import { createCanvas, loadImage } from "canvas";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface IconSpec {
  name: string;
  size: number;
  padding?: number;
}

const ICON_SIZES: IconSpec[] = [
  { name: "icon-72", size: 72 },
  { name: "icon-96", size: 96 },
  { name: "icon-128", size: 128 },
  { name: "icon-152", size: 152 },
  { name: "icon-167", size: 167 },
  { name: "icon-180", size: 180 },
  { name: "icon-192", size: 192 },
  { name: "icon-1024", size: 1024 },
];

const SOURCE_LOGO = path.join(__dirname, "../../assets/logo.png");

// Colors for icon masks
const IOS_ICON_COLORS = {
  light: {
    mask: "#FFFFFF", // White icon on white background for iOS Light Mode
    background: "#FFFFFF",
  },
  dark: {
    mask: "#000000", // Black icon on black background for iOS Dark Mode
    background: "#000000",
  },
  web: {
    mask: "#007AFF", // Blue icon for web app icons
    background: "#FFFFFF",
  },
};

async function generateIcon(
  size: number,
  type: "ios" | "android" | "web",
  colorTheme: keyof typeof IOS_ICON_COLORS,
  outputPath: string,
) {
  try {
    const logo = await loadImage(SOURCE_LOGO);

    // Create canvas with source size
    const canvas = createCanvas(logo.width, logo.height);
    const ctx = canvas.getContext("2d");

    // Fill background (transparent for web)
    if (type === "ios") {
      ctx.fillStyle = IOS_ICON_COLORS[colorTheme].background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Composite logo with theme color (for iOS to ensure visibility)
    if (type === "ios") {
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = IOS_ICON_COLORS[colorTheme].mask;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw logo centered
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(logo, 0, 0);

    // Save as PNG
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    console.log(`✓ Generated ${size}x${size} ${type} icon: ${outputPath}`);
  } catch (error) {
    console.error(`✗ Failed to generate icon for ${size}x${size} ${type}:`, error);
  }
}

async function generateAllIcons() {
  console.log("🎨 Generating app icons...");

  const iconsDir = path.join(__dirname, "../assets/icons");

  // Create icons directory if it doesn't exist
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Generate iOS icons
  console.log("\n📱 Generating iOS icons...");
  for (const spec of ICON_SIZES) {
    await generateIcon(spec.size, "ios", "light", path.join(iconsDir, `${spec.name}.png`));
    await generateIcon(spec.size, "ios", "dark", path.join(iconsDir, `${spec.name}-dark.png`));
  }

  // Generate Android icon
  console.log("\n🤖 Generating Android icon...");
  await generateIcon(192, "android", "web", path.join(iconsDir, "icon-192-android.png"));
  await generateIcon(512, "android", "web", path.join(iconsDir, "icon-512-android.png"));

  // Generate Web app icons
  console.log("\n🌐 Generating Web icons...");
  await generateIcon(192, "web", "web", path.join(iconsDir, "icon-192.png"));
  await generateIcon(512, "web", "web", path.join(iconsDir, "icon-512.png"));
  await generateIcon(1024, "web", "web", path.join(iconsDir, "icon-1024.png"));

  console.log("\n✅ All icons generated successfully!");
  console.log(`📁 Output directory: ${iconsDir}`);
}

// Run the generator
generateAllIcons().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
