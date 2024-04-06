import type { DictProps } from './typings';
import Dict from './Dict';
import { Tag } from 'antd';

const DictTag = (props: DictProps) => {
  return (
    <Dict
      {...props}
      render={({ value, getRealName, style }, { dictItems }) => {
        let text = '';
        let color;

        for (let index = 0; index < dictItems.length; index += 1) {
          const item = dictItems[index];
          if (item.realVal === value) {
            console.log(item);
            
            text = getRealName(item);
            color = item.attributes.tagColor;
            break;
          }
        }

        return (
          <Tag color={color} style={{ ...style }}>
            {text}
          </Tag>
        );
      }}
    />
  );
};

export default DictTag;
