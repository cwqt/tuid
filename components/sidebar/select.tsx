import { useStore } from 'data/store';
import { useEffect } from 'react';

export default function SelectSidebar(props: { className?: string }) {
  const { editor, setEditorProperties } = useStore();

  return (
    <div>
      <p>
        In <b>select mode</b> you can click and drag an area to select an area,
        then click and drag the selection to move it around.
      </p>
    </div>
  );
}
