import { Button, message } from 'antd';
const Message = ({text}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const info = () => {
    messageApi.info({text});
  };
  return (
    <>
      {contextHolder}
      <Button type="primary" onClick={info}>
        Display normal message
      </Button>
    </>
  );
};
export default App;