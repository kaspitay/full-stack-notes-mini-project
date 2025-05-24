type NotificationProps = {
  message: string;
}

const Notification = ({ message }: NotificationProps) => {
  return (
    <div className="notification">
      {message}
    </div>
  );
};

export default Notification;