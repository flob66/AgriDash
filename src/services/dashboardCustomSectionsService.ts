import { supabase } from './supabaseClient';

export interface CustomField {
  key: string;
  value: string;
}

export interface DashboardSection {
  id: number;
  title: string;
  order_index: number;
  is_custom: boolean;
  fields: CustomField[];
}

export async function getDashboardSections(userId: string): Promise<DashboardSection[]> {
  const { data: sections, error: sectionsError } = await supabase
    .from('dashboard_sections')
    .select('id, title, order_index, is_custom')
    .eq('user_id', userId)
    .order('order_index', { ascending: true });

  if (sectionsError) throw sectionsError;
  if (!sections) return [];

  const sectionsWithFields = await Promise.all(
    sections.map(async (section) => {
      let fields: { key: string; value: string }[] = [];
      
      if (section.is_custom) {
        const { data, error } = await supabase
          .from('dashboard_section_fields')
          .select('key, value')
          .eq('section_id', section.id)
          .eq('is_enabled', true);
        if (!error && data) fields = data.map(f => ({ key: f.key, value: f.value }));
      } else if (section.title === 'key_info') {
        const { data, error } = await supabase
          .from('dashboard_section_fields')
          .select('key, value')
          .eq('section_id', section.id);
        if (!error && data) fields = data.map(f => ({ key: f.key, value: f.value }));
      }

      return {
        id: section.id,
        title: section.title,
        order_index: section.order_index,
        is_custom: section.is_custom,
        fields,
      };
    })
  );

  return sectionsWithFields;
}

export async function updateSectionsOrder(
  updates: { id: number; order_index: number }[]
): Promise<void> {
  for (const update of updates) {
    const { error } = await supabase
      .from('dashboard_sections')
      .update({ order_index: update.order_index })
      .eq('id', update.id);
    if (error) throw error;
  }
}

export async function getCustomSections(userId: string): Promise<DashboardSection[]> {
  const sections = await getDashboardSections(userId);
  return sections.filter(s => s.is_custom === true);
}

export async function createCustomSection(
  userId: string,
  title: string,
  fields: CustomField[]
): Promise<DashboardSection> {
  const { data: sections, error: sectionsError } = await supabase
    .from('dashboard_sections')
    .select('order_index')
    .eq('user_id', userId)
    .eq('is_custom', true)
    .order('order_index', { ascending: false })
    .limit(1);

  if (sectionsError) throw sectionsError;

  const nextOrder = sections && sections.length > 0 ? sections[0].order_index + 1 : 0;

  const { data: newSection, error: insertError } = await supabase
    .from('dashboard_sections')
    .insert({
      user_id: userId,
      title: title,
      is_custom: true,
      order_index: nextOrder,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  const fieldsToInsert = fields.map(field => ({
    section_id: newSection.id,
    key: field.key,
    value: field.value,
    field_type: 'text',
    is_enabled: true,
  }));

  const { error: fieldsError } = await supabase
    .from('dashboard_section_fields')
    .insert(fieldsToInsert);

  if (fieldsError) throw fieldsError;

  return {
    id: newSection.id,
    title: newSection.title,
    order_index: newSection.order_index,
    is_custom: true,
    fields: fields,
  };
}

export async function deleteCustomSection(sectionId: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { error } = await supabase.rpc('delete_custom_section', {
    section_id_param: sectionId,
    user_id_param: user.id,
  });

  if (error) {
    const { error: deleteFieldsError } = await supabase
      .from('dashboard_section_fields')
      .delete()
      .eq('section_id', sectionId);
    if (deleteFieldsError) throw deleteFieldsError;

    const { error: deleteSectionError } = await supabase
      .from('dashboard_sections')
      .delete()
      .eq('id', sectionId)
      .eq('user_id', user.id);
    if (deleteSectionError) throw deleteSectionError;
  }
}