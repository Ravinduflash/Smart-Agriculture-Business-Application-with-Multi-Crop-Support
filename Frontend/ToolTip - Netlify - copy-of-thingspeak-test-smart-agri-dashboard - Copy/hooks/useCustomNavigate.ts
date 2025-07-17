import { useNavigation } from '../contexts/NavigationContext';

export const useCustomNavigate = () => {
  const { navigateTo } = useNavigation();
  return navigateTo;
};
