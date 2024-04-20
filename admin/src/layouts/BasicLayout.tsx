import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import { isLogin } from '@/utils/Ballcat';
import settings from '@/config/ProjectConfig';
import I18n from '@/utils/I18nUtils';
import Notify from '@/utils/NotifyUtils';
import type { ExpandRoute } from '@/utils/RouteUtils';
import RouteUtils from '@/utils/RouteUtils';
import type {
  ProLayoutProps as ProLayoutProps,
  MenuDataItem,
  Settings,
} from '@ant-design/pro-layout';
import ProLayout, { WaterMark } from '@ant-design/pro-layout';
import React, { lazy, useEffect, useRef, useState } from 'react';
import { KeepAlive as ReactKeepAlive, useAliveController } from 'react-activation';
import { history, Link, useIntl, useModel } from 'umi';
import { Navigate, Outlet, useAccessMarkedRoutes, useAppData } from '@umijs/max';

export type BasicLayoutProps = {
  breadcrumbNameMap: Record<string, MenuDataItem>;
  route: ProLayoutProps['route'] & {
    authority: string[];
    routes: any[];
  };
  settings: Settings;
} & ProLayoutProps;

const NotFound = () => <div>404</div>
const Wrapper = ({ children }: any) => (
  <React.Suspense>{children}</React.Suspense>
)
const Add = React.lazy(() => import('@/pages/system/user/SysUserPage'))

const MAPS: any = {
  '/table': (
    <Wrapper>
      <Add />
    </Wrapper>
  ),
}

const renderMenuItem = (title: string, hasSub: boolean, icon?: string) => {
  return (
    <span className="ant-pro-menu-item" title={title}>
      {/* {!icon ? undefined : <Icon type={icon} />} */}
      <span className="ant-pro-menu-item-title">{title}</span>
    </span>
  );
};

// 过滤出需要显示的路由, 这里的filterFn 指 不希望显示的层级
const filterRoutes = (routes: IRoute[], filterFn: (route: IRoute) => boolean) => {
  if (routes.length === 0) {
    return []
  }

  let newRoutes = []
  for (const route of routes) {
    const newRoute = { ...route };
    if (filterFn(route)) {
      if (Array.isArray(newRoute.routes)) {
        newRoutes.push(...filterRoutes(newRoute.routes, filterFn))
      }
    } else {
      if (Array.isArray(newRoute.children)) {
        newRoute.children = filterRoutes(newRoute.children, filterFn);
        newRoute.routes = newRoute.children;
      }
      newRoutes.push(newRoute);
    }
  }

  return newRoutes;
}

// 格式化路由 处理因 wrapper 导致的 菜单 path 不一致
const mapRoutes = (routes: IRoute[]) => {
  if (routes.length === 0) {
    return []
  }
  return routes.map(route => {
    // 需要 copy 一份, 否则会污染原始数据
    const newRoute = { ...route }
    if (route.originPath) {
      newRoute.path = route.originPath
    }

    if (Array.isArray(route.routes)) {
      newRoute.routes = mapRoutes(route.routes);
    }

    if (Array.isArray(route.children)) {
      newRoute.children = mapRoutes(route.children);
    }

    return newRoute
  })
}
const BasicLayout: React.FC<BasicLayoutProps> = (props) => {
  const {
    children,
    location = {
      pathname: '/',
    },
  } = props;
  const { clientRoutes, pluginManager } = useAppData();
  const { clear } = useAliveController();
  Notify.setCleanCache(clear);

  const { routeArray, firstPath, load, setLoad } = useModel('dynamic-route');
  const { initialState } = useModel('@@initialState');
  const { isContentFull } = useModel('full-screen');
  const actionRef = useRef<{
    reload: () => void;
  }>();
  const { multiTab } = initialState?.settings || {};

  I18n.setIntl(useIntl());
  // 国际化关闭, 当前语言与默认语言不符
  if (!settings.i18n && I18n.getLocal() !== settings.defaultLocal) {
    // 切换语言
    I18n.setLocal(settings.defaultLocal);
  }

  const [collapsed, setCollapsed] = useState(false);
  const [keepAliveProps, setKeepAliveProps] = useState<{ id?: string; name?: string }>({});

  console.log(clientRoutes)
  // 直接获取自定义的 layout，在 routes.ts 中配置的
  const route = clientRoutes[1]
  
  // useEffect(() =>{
  //   console.log('clientRoutes')
  //   const roleRoutes = [{name:'角色管理',path:'/role'}]
  //   route.children.unshift(
  //     ...roleRoutes.map((path: any) => ({
  //       id: path.path,
  //       name: path.name,
  //       path: path.path,
  //       parentId: "ant-design-pro-layout",
  //       element: <NotFound />,
  //     }))
  //   )
  //   actionRef.current?.reload();
  //   console.log(route)
  // },[clientRoutes])

  // useEffect(() => {
  //   if (location.pathname && location.pathname !== '/') {
  //     const currenMenu = RouteUtils.getMenuDict()[location.pathname];
  //     const newKeepAliveProps = {
  //       id: `${currenMenu?.id}`,
  //       name: currenMenu?.path,
  //     };
  //     // 404页面处理
  //     if (!newKeepAliveProps.name) {
  //       newKeepAliveProps.id = location.pathname;
  //       newKeepAliveProps.name = location.pathname;
  //     }

  //     setKeepAliveProps(newKeepAliveProps);
  //   }
  // }, [location.pathname]);

  // useEffect(() => {
  //   if (load) {
  //     return;
  //   }
  //   const newRoute: ExpandRoute = { ...route };
  //   newRoute.routes = [];
  //   newRoute.items = [];

  //   if (routeArray && routeArray.length > 0) {
  //     for (let i = 0; i < routeArray.length; i += 1) {
  //       const menu = routeArray[i];
  //       newRoute.items.push(menu);
  //       newRoute.routes.push(menu);
  //     }

  //     route.routes = newRoute.routes;
  //     route.items = newRoute.routes;
  //     setLoad(true);

  //     if (location.pathname && location.pathname !== '/') {
  //       history.replace(location.pathname);
  //     }
  //   }
  // }, [routeArray, load]);

  if (location.pathname === '/' && firstPath && firstPath !== '/') {
    history.push(firstPath);
  }

  let contentMarginTop = 56;
  if (!initialState?.settings?.fixedHeader) {
    contentMarginTop = 24;
  }

  if (initialState?.settings?.layout === 'mix' && collapsed) {
    setCollapsed(false);
  }
  return (
    <ProLayout
      footerRender={() => <Footer />}
      {...initialState?.settings}
      logo={settings.logo}
      actionRef={actionRef}
      formatMessage={I18n.getIntl().formatMessage}
      {...props}
      // loading={!load || keepAliveProps.id === undefined || !initialState?.user?.access_token}
      route={route}
      collapsedButtonRender={false}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      contentStyle={{
        marginTop: multiTab || isContentFull ? `${contentMarginTop}px` : undefined,
      }}
      siderWidth={isContentFull ? 0 : undefined}
      headerHeight={isContentFull ? 0 : undefined}
      headerRender={(headerProps, defaultDom) => (isContentFull ? undefined : defaultDom)}
      onPageChange={async () => {
        // 如果没有登录，重定向到 login
        if (!isLogin(initialState)) {
          Notify.logout();
        }
      }}
      onMenuHeaderClick={() => history.push(firstPath || '/')}
      subMenuItemRender={(item) => {
        const { title, icon } = item.meta;
        return renderMenuItem(title, true, icon);
      }}
      menuItemRender={(menuItemProps) => {
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
      }}
    >

      <WaterMark
        content={settings.waterMark ? initialState?.user?.info?.nickname : undefined}
        style={{ height: '100%' }}
      >

        {/* <ReactKeepAlive
          key={`keep-alive-${keepAliveProps.id}`}
          id={keepAliveProps.id}
          name={keepAliveProps.name}
        > */}
            
          <Outlet />
        {/* </ReactKeepAlive> */}
      </WaterMark>
    </ProLayout>
  );
};

export default BasicLayout;
