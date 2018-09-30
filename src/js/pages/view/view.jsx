import React from 'react';
import { render as reactRender } from 'react-dom';

const Foo = (props) => {
  return (
    <div>
      time: {props.time}
    </div>
  );
}

reactRender(
  <Foo time="123"/>,
  document.querySelector('.browser')
);
