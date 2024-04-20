import { Footer, Question, SelectLang, AvatarDropdown, AvatarName } from '@/components';
import { LinkOutlined, HeartOutlined, SmileOutlined, CrownOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { PageContainer, SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link, Navigate } from '@umijs/max';
import type { GLOBAL } from '@/typings';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import { menu } from '@/services/atreus/system';
import React from 'react';
import { Token } from './utils/Ballcat';
import Icon from './components/Icon';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
const fetchMenu = async () => {
  const msg = await menu.menuRouter({
    skipErrorHandler: true,
  });
  return msg.data;
}
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  user?: GLOBAL.Is.user;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };

  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    let res = {
      fetchUserInfo: fetchUserInfo,
      currentUser: currentUser,
      user: currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    }
    return res;
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

const IconMap = {
  smile: <SmileOutlined />,
  heart: <HeartOutlined />,
  crown: <CrownOutlined />,
};

const renderMenuItem = (title: string, hasSub: boolean, icon?: string) => {
  const iconType = typeof(icon)
  return (
    <span className="ant-pro-menu-item" title={title}>
      {/* string 时，使用 Icon 组件，如果本身 icon 已经是 object 了，则直接渲染 */}
      {!icon || icon === '' ? undefined : iconType === 'string' ? <Icon type={icon}/> : icon }
      <span className="ant-pro-menu-item-title">{title}</span>
    </span>
  );
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    actionsRender: () => [<Question key="doc" />, <SelectLang key="SelectLang" />],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
        <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
          <LinkOutlined />
          <span>OpenAPI 文档</span>
        </Link>,
      ]
      : [],
    menuHeaderRender: undefined,
    subMenuItemRender: (item) => {
      const { name: title, icon } = item;
      return renderMenuItem(title, true, icon);
    },
    menuItemRender: (menuItemProps) => {
      const { name: title, icon } = menuItemProps;
      if (!menuItemProps.path || location.pathname === menuItemProps.path) {
        return renderMenuItem(title, false, icon);
      }

      if (menuItemProps.isUrl) {
        return (
          <a target={menuItemProps.target} href={menuItemProps.path}>
            {renderMenuItem(title, false, icon)}
          </a>
        );
      }

      return (
        <Link to={menuItemProps.path}>{renderMenuItem(title, false, icon)}</Link>
      );
    },
    // menu: { request: async () => loopMenuItem(initialState?.route) },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <PageContainer header={{ title: false }}>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </PageContainer>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};

const NotFound = () => <div>404</div>
const Wrapper = ({ children }: any) => (
  <React.Suspense>{children}</React.Suspense>
)

let roleRoutes: any[] = []

const getRoleRoutes = () => {
  return fetchMenu().then(res => {
    roleRoutes = res.routes
  }).catch(err => {
    console.error(err)
  })
}

export function patchRoutes({ routes, routeComponents }) {
  console.log('patchRoutes')
}

const loopRouteItem = (menus: any[], pId: number | string): RouteItem[] => {
  return menus.flatMap((item) => {
    let Component: React.ComponentType<any> | null = null;
    if (item.uri !== '') {
      // 防止配置了路由，但本地暂未添加对应的页面，产生的错误
      // item.uri = 'system/user/SysUserPage'
      Component = React.lazy(() => new Promise((resolve, reject) => {
        import(`@/pages/${item.uri}`)
          .then(module => resolve(module))
          .catch((error) => {
            console.error(error)
            resolve(import(`@/pages/exception/404.tsx`))
          })
      }))
    }
    if (item.type === 0) {
      return [
        {
          path: item.path,
          name: item.title,
          icon: item.icon,
          id: item.id,
          parentId: pId,
          children: [
            {
              path: item.path,
              element: <Navigate to={item.children[0].path} replace />,
            },
            ...loopRouteItem(item.children, item.id)
          ]
        }
      ]
    } else {
      return [
        {
          path: item.path,
          name: item.title,
          icon: item.icon,
          id: item.id,
          parentId: pId,
          element: (
            <React.Suspense fallback={<div>Loading...</div>}>
              {Component && <Component />}
            </React.Suspense>
          )
        }
      ]
    }
  })
}

export const patchClientRoutes = ({ routes }: any) => {
  console.log('patchClientRoutes', routes)
  // 这里获取的是 routes.ts 中配置自定义 layout
  const routerIndex = routes.findIndex((item: any) => item.path === '/')
  const parentId = routes[routerIndex].id


  const MAPS: any = {}
  if (roleRoutes) {
    const newRoutes = routes[routerIndex]['routes']

    // 往路由中动态添加
    newRoutes.push(
      ...loopRouteItem(roleRoutes, parentId)
    )
  }

}

export const render = async (oldRender: Function) => {
  // 如果请求太慢，可选：自己实现一个加载器效果
  console.log('render')
  document.querySelector('#root')!.innerHTML = `<div>loading...</div>`
  const token = Token.get()
  if(token){
    await getRoleRoutes()
  }
  
  oldRender()
}