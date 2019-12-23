import { Tasks } from '@bloomreach/cli-tasks';

export function mockChoices(index: number): void {
  Tasks.choice = jest.fn().mockImplementation((
    _message: string,
    choices: { name: string; value: any }[],
    next: (choice: any) => Promise<void>,
  ) => next(choices[index].value));
}

export function mockCustomPath(...ids: string[]): void {
  Tasks.customPath = jest.fn().mockImplementation((
    confirmMsg: string,
    _pathLabel: string,
    next: (path: string) => Promise<void>,
  ) => {
    const pathId = ids.find((id: string) => confirmMsg.includes(id));
    return pathId
      ? next(`/custom-path/${pathId}`)
      : next('/custom-path');
  });
}
