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

import { createCanvas, loadImage } from "canvas";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

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

const SOURCE_LOGO = path.join(__dirname, "../assets/logo.png");

// Colors for icon backgrounds - using modern gradient/solid colors
const ICON_THEMES = {
  gradient: {
    // Purple to blue gradient (modern app style)
    colors: ["#667eea", "#764ba2"],
    background: "gradient",
  },
  solid: {
    // Solid brand color
    colors: ["#6366f1"],
    background: "solid",
  },
  dark: {
    // Dark theme
    colors: ["#1f2937"],
    background: "solid",
  },
};

async function generateIcon(
  size: number,
  theme: keyof typeof ICON_THEMES,
  outputPath: string,
  rounded: boolean = true,
) {
  try {
    const logo = await loadImage(SOURCE_LOGO);

    // Create canvas with target size
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    // Create rounded rectangle or square background
    if (rounded) {
      const radius = size * 0.225; // iOS style corner radius (22.5%)
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
    } else {
      ctx.rect(0, 0, size, size);
    }

    // Fill with gradient or solid color
    const themeConfig = ICON_THEMES[theme];
    if (
      themeConfig.background === "gradient" &&
      themeConfig.colors.length > 1
    ) {
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, themeConfig.colors[0]);
      gradient.addColorStop(1, themeConfig.colors[1]);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = themeConfig.colors[0];
    }
    ctx.fill();

    // Calculate dimensions to fit logo in canvas with padding
    const padding = size * 0.2; // 20% padding for better appearance
    const availableSize = size - padding * 2;
    const scale = Math.min(
      availableSize / logo.width,
      availableSize / logo.height,
    );
    const scaledWidth = logo.width * scale;
    const scaledHeight = logo.height * scale;
    const x = (size - scaledWidth) / 2;
    const y = (size - scaledHeight) / 2;

    // Add subtle shadow behind logo
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = size * 0.02;
    ctx.shadowOffsetY = size * 0.01;

    // Draw logo centered and scaled
    ctx.drawImage(logo, x, y, scaledWidth, scaledHeight);

    // Save as PNG
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    console.log(`✓ Generated ${size}x${size} icon: ${outputPath}`);
  } catch (error) {
    console.error(`✗ Failed to generate icon for ${size}x${size}:`, error);
  }
}

async function generateAllIcons() {
  console.log("🎨 Generating modern app icons with gradient backgrounds...");

  const iconsDir = path.join(__dirname, "../assets/icons");

  // Create icons directory if it doesn't exist
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Generate iOS icons with gradient theme
  console.log("\n📱 Generating iOS icons (rounded, gradient)...");
  for (const spec of ICON_SIZES) {
    await generateIcon(
      spec.size,
      "gradient",
      path.join(iconsDir, `${spec.name}.png`),
      true, // rounded
    );
  }

  // Generate iOS dark mode icons
  console.log("\n🌙 Generating iOS dark mode icons...");
  for (const spec of ICON_SIZES) {
    await generateIcon(
      spec.size,
      "dark",
      path.join(iconsDir, `${spec.name}-dark.png`),
      true, // rounded
    );
  }

  // Generate Android icons (square, gradient)
  console.log("\n🤖 Generating Android icons (adaptive)...");
  await generateIcon(
    192,
    "gradient",
    path.join(iconsDir, "icon-192-android.png"),
    false, // square for adaptive icons
  );
  await generateIcon(
    512,
    "gradient",
    path.join(iconsDir, "icon-512-android.png"),
    false, // square for adaptive icons
  );

  // Generate Web app icons (rounded)
  console.log("\n🌐 Generating Web PWA icons...");
  await generateIcon(
    192,
    "gradient",
    path.join(iconsDir, "icon-192.png"),
    true,
  );
  await generateIcon(
    512,
    "gradient",
    path.join(iconsDir, "icon-512.png"),
    true,
  );
  await generateIcon(
    1024,
    "gradient",
    path.join(iconsDir, "icon-1024.png"),
    true,
  );

  console.log("\n✅ All icons generated successfully!");
  console.log(`📁 Output directory: ${iconsDir}`);
  console.log("\n💡 Tip: Edit ICON_THEMES in the script to customize colors");
}

// Run the generator
generateAllIcons().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
