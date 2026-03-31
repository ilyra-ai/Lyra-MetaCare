import type { Field } from '@puckeditor/core';
import { RichTextMenu } from '@puckeditor/core';

type NivelHeadingRichTextLyra = 1 | 2 | 3 | 4;

export function criarCampoRichTextLyra({
  label,
  initialHeight = 220,
  headingLevels = [2, 3, 4],
  habilitarBlockquote = true,
}: {
  label: string;
  initialHeight?: number;
  headingLevels?: NivelHeadingRichTextLyra[];
  habilitarBlockquote?: boolean;
}) {
  return {
    type: 'richtext',
    label,
    contentEditable: true,
    initialHeight,
    options: {
      heading: { levels: headingLevels },
      code: false,
      codeBlock: false,
      horizontalRule: false,
      hardBreak: false,
      blockquote: habilitarBlockquote ? {} : false,
    },
    renderMenu: ({ readOnly }) => {
      if (readOnly) {
        return null;
      }

      return (
        <RichTextMenu>
          <RichTextMenu.Group>
            <RichTextMenu.Bold />
            <RichTextMenu.Italic />
            <RichTextMenu.Underline />
            <RichTextMenu.Strikethrough />
          </RichTextMenu.Group>
          <RichTextMenu.Group>
            <RichTextMenu.HeadingSelect />
            <RichTextMenu.ListSelect />
          </RichTextMenu.Group>
          <RichTextMenu.Group>
            {habilitarBlockquote ? <RichTextMenu.Blockquote /> : null}
            <RichTextMenu.AlignSelect />
          </RichTextMenu.Group>
        </RichTextMenu>
      );
    },
  } satisfies Field<string>;
}
