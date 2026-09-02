/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders splash screen first', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  const text = renderer!.root.findByType(require('react-native').Text);
  expect(text.props.children).toBe('Kasi_Capital');

  ReactTestRenderer.act(() => {
    renderer!.unmount();
  });
});

test('transitions to blank home screen after splash', () => {
  jest.useFakeTimers();
  let renderer: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  ReactTestRenderer.act(() => {
    jest.advanceTimersByTime(2000);
  });

  const home = renderer!.root.findByProps({ testID: 'home-screen' });
  expect(home).toBeTruthy();

  ReactTestRenderer.act(() => {
    renderer!.unmount();
  });
  jest.useRealTimers();
});
