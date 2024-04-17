declare module 'slash2';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module 'omit.js';
declare module 'numeral';
declare module '@antv/data-set';
declare module 'mockjs';
declare module 'react-fittext';
declare module 'bizcharts-plugin-slider';

declare const REACT_APP_ENV: 'test' | 'dev' | 'pre' | false;

declare namespace GLOBAL {
    type Is = {
      settings?: Partial<ProjectSetting>;
      routerLoad?: boolean;
      user?: GLOBAL.UserInfo;
    };
  
    type Router = {
      hidden: boolean;
      icon: string;
      id: number;
      keepAlive: boolean;
      parentId: number;
      path: string;
      remarks: string;
      /**
       * 1 组件, 2 内链, 3 外链
       */
      targetType: 1 | 2 | 3;
      title: string;
      /**
       * 0: 目录 1: 菜单 2: 按钮
       */
      type: 0 | 1 | 2;
      uri: string;
      children?: Router[];
    };
  
    type UserInfo = {
      info: {
        avatar?: string;
        nickname?: string;
        type: number;
        userId: number;
        username: string;
      };
      permissions: string[];
      access_token: string;
      refresh_token: string;
      roles: string[];
      scope: 'server';
      token_type: 'bearer';
      attributes: {
        permissions: string[];
        roleCodes: string[];
      };
    };
  }
  