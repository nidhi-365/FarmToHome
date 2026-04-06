import styles from './Button.module.css';

const Button = ({
  children,
  variant = 'primary',  // primary | secondary | outline | ghost | danger
  size = 'md',          // sm | md | lg
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
      ].join(' ')}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <span className={styles.spinner} /> : children}
    </button>
  );
};

export default Button;
