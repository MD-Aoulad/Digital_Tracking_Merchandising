#!/usr/bin/env node

/**
 * Script to fix React Native deprecation warnings
 * 
 * This script helps identify and fix common deprecation warnings:
 * 1. "shadow*" style props are deprecated - Use "boxShadow"
 * 2. props.pointerEvents is deprecated - Use style.pointerEvents
 * 3. Invalid icon names for Ionicons
 */

const fs = require('fs');
const path = require('path');

// Common fixes for deprecation warnings
const fixes = {
  // Invalid Ionicons names and their replacements
  invalidIcons: {
    'badge': 'id-card',
    'badge-outline': 'id-card-outline',
    'badge-sharp': 'id-card-sharp',
  },
  
  // Shadow property replacements
  shadowProperties: [
    'shadowColor',
    'shadowOffset',
    'shadowOpacity', 
    'shadowRadius'
  ],
  
  // Pointer events property
  pointerEventsProperty: 'pointerEvents'
};

/**
 * Check if a file contains deprecated properties
 */
function checkFileForDeprecations(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check for deprecated shadow properties
  fixes.shadowProperties.forEach(prop => {
    const regex = new RegExp(`${prop}:`, 'g');
    const matches = content.match(regex);
    if (matches) {
      issues.push({
        type: 'shadow',
        property: prop,
        count: matches.length,
        file: filePath
      });
    }
  });
  
  // Check for deprecated pointerEvents prop
  const pointerEventsRegex = /pointerEvents:/g;
  const pointerMatches = content.match(pointerEventsRegex);
  if (pointerMatches) {
    issues.push({
      type: 'pointerEvents',
      property: 'pointerEvents',
      count: pointerMatches.length,
      file: filePath
    });
  }
  
  // Check for invalid icon names
  Object.keys(fixes.invalidIcons).forEach(invalidIcon => {
    const iconRegex = new RegExp(`name="${invalidIcon}"`, 'g');
    const iconMatches = content.match(iconRegex);
    if (iconMatches) {
      issues.push({
        type: 'invalidIcon',
        property: invalidIcon,
        replacement: fixes.invalidIcons[invalidIcon],
        count: iconMatches.length,
        file: filePath
      });
    }
  });
  
  return issues;
}

/**
 * Recursively find all TypeScript/JavaScript files
 */
function findFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Generate a report of all deprecation issues
 */
function generateReport(issues) {
  console.log('\n=== React Native Deprecation Warning Report ===\n');
  
  if (issues.length === 0) {
    console.log('✅ No deprecation issues found!');
    return;
  }
  
  const shadowIssues = issues.filter(i => i.type === 'shadow');
  const pointerIssues = issues.filter(i => i.type === 'pointerEvents');
  const iconIssues = issues.filter(i => i.type === 'invalidIcon');
  
  if (shadowIssues.length > 0) {
    console.log('🔴 Shadow Property Issues:');
    shadowIssues.forEach(issue => {
      console.log(`  ${issue.file}: ${issue.count} instances of ${issue.property}`);
    });
    console.log('\n  💡 Solution: Use the shadow utility from src/utils/shadows.ts');
    console.log('  Example: import { shadowStyles } from "../utils/shadows";');
    console.log('  Then replace shadow properties with: ...shadowStyles.medium\n');
  }
  
  if (pointerIssues.length > 0) {
    console.log('🔴 Pointer Events Issues:');
    pointerIssues.forEach(issue => {
      console.log(`  ${issue.file}: ${issue.count} instances of ${issue.property}`);
    });
    console.log('\n  💡 Solution: Move pointerEvents from props to style object\n');
  }
  
  if (iconIssues.length > 0) {
    console.log('🔴 Invalid Icon Issues:');
    iconIssues.forEach(issue => {
      console.log(`  ${issue.file}: ${issue.count} instances of "${issue.property}" -> use "${issue.replacement}"`);
    });
    console.log('\n  💡 Solution: Replace invalid icon names with valid Ionicons names\n');
  }
  
  console.log(`\n📊 Summary: ${issues.length} total issues found`);
  console.log(`   - Shadow issues: ${shadowIssues.length}`);
  console.log(`   - Pointer events issues: ${pointerIssues.length}`);
  console.log(`   - Invalid icon issues: ${iconIssues.length}`);
}

/**
 * Main function
 */
function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ src directory not found');
    process.exit(1);
  }
  
  console.log('🔍 Scanning for deprecation warnings...');
  
  const files = findFiles(srcDir);
  const allIssues = [];
  
  files.forEach(file => {
    const issues = checkFileForDeprecations(file);
    allIssues.push(...issues);
  });
  
  generateReport(allIssues);
  
  if (allIssues.length > 0) {
    console.log('\n📝 Next steps:');
    console.log('1. Use the shadow utility for shadow properties');
    console.log('2. Move pointerEvents to style objects');
    console.log('3. Replace invalid icon names with valid Ionicons');
    console.log('\n💡 Run this script again after making changes to verify fixes');
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFileForDeprecations, findFiles, generateReport }; 