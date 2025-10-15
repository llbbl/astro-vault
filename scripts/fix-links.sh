#!/bin/bash

# Fix all internal wiki links to include /content/ prefix
# This script finds links like ](/databases/ and replaces them with ](/content/databases/

CONTENT_DIR="./content"

echo "Fixing internal links in markdown files..."

# Automatically discover all folders in content directory
for folder_path in "$CONTENT_DIR"/*/ ; do
  # Extract just the folder name from the path
  folder=$(basename "$folder_path")

  echo "Processing folder: $folder"

  # Find all .md files and replace ](/folder/ with ](/content/folder/
  find "$CONTENT_DIR" -name "*.md" -type f -exec sed -i '' "s|](/$folder/|](/content/$folder/|g" {} +
done

echo "Done! All internal links have been updated."
