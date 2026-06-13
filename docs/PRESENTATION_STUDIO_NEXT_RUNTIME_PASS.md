# Presentation Studio Next Runtime Pass

## Focus

The consolidated editor work is now ready for a controlled runtime pass.

## Runtime sequence

1. Run the SlideEditor toolbar migration in dry-run mode.
2. Review the planned import, handler, and toolbar replacement changes.
3. Apply the migration.
4. Run the Presentation Studio verification script.
5. Open the editor and confirm the core actions still work.

## Core actions to verify

- AI Generate
- Templates and Gallery
- PPTX Import
- Add Slide
- Duplicate Slide
- Delete Slide
- Grid View
- Animated Backgrounds
- Brand Assets
- Save as Template
- Present
- Review and Export

## Success state

The editor has one clean consolidated toolbar with six groups: Create, Edit, View, Brand, Review and Export, and Save System. The old repeated buttons are removed, while the existing canvas, slide rail, dialogs, imports, exports, and presentation mode remain intact.
