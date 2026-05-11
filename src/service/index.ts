// import { request } from '@design-platform/shared';

// interface ISaveOption<T> {
//   fileId: string;
//   content: T;
// }

// export const onSave = <T>(payload: ISaveOption<T>) => {
//   const { fileId, content } = payload;
//   return request.post('/page/content/update', { fileId, content });
// };

// export const getContent = (payload: Pick<ISaveOption<never>, 'fileId'>) => {
//   return request.post('/page/content/get', { fileId: payload.fileId });
// };
